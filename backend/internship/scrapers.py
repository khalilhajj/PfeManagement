"""
Web scraping module for internship opportunities
Scrapes job/internship listings from various sources
"""

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
from django.utils import timezone
import time


def scrape_tanitjobs(html_content=None):
    """
    Scrape internship opportunities from Tanitjobs.tn
    If html_content is provided, parses that instead of fetching from web.
    Returns list of dicts with opportunity data
    """
    import cloudscraper
    
    opportunities = []
    
    try:
        soup = None
        
        if html_content:
            print("Parsing provided HTML content...")
            soup = BeautifulSoup(html_content, 'html.parser')
        else:
            print("Starting Cloudscraper...")
            scraper = cloudscraper.create_scraper()
            
            url = "https://www.tanitjobs.com/"
            print(f"Loading {url}...")
            response = scraper.get(url)
            
            if response.status_code != 200:
                print(f"Failed to load page: {response.status_code}")
                return opportunities
                
            soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the main section with latest job offers
        main_section = soup.find('section', class_='main-sections__listing__latest')
        if not main_section:
            print("Could not find main section with job listings")
            # Try finding the container directly if section class changed
            main_section = soup.find('div', class_='listing__title')
            if main_section:
                main_section = main_section.find_parent('section')
            
            if not main_section:
                return opportunities
        
        # Find job listings within the section
        job_cards = main_section.find_all('article', class_='listing-item__jobs')
        
        print(f"Found {len(job_cards)} job listings")
        
        for card in job_cards[:15]:  # Limit to 15 jobs
            try:
                # Extract title and URL from the <a> tag
                title_link = card.find('a', class_='link')
                if not title_link:
                    continue
                
                title = title_link.get_text(strip=True)
                job_url = title_link.get('href', '')
                
                if not job_url or not title:
                    continue
                
                # Extract company name
                company_elem = card.find('span', class_='listing-item-info-company')
                company = company_elem.get_text(strip=True).replace(' - ', '').strip() if company_elem else "Not specified"
                
                # Extract location
                location_elem = card.find('span', class_='listing-item-info-location')
                location = location_elem.get_text(strip=True) if location_elem else "Tunisia"
                
                # Extract date
                date_elem = card.find('div', class_='listing-item__date')
                date_posted = date_elem.get_text(strip=True) if date_elem else ""
                
                print(f"Processing: {title[:50]}...")
                
                full_description = f"Poste chez {company}.\nLieu: {location}.\nDate de publication: {date_posted}"
                requirements_text = f"Entreprise: {company}"

                # Only try to fetch details if we are in online mode
                if not html_content and job_url:
                    try:
                        # Visit job details page
                        print(f"Loading details page: {job_url[:80]}...")
                        # Use same scraper instance
                        detail_response = scraper.get(job_url)
                        
                        if detail_response.status_code == 200:
                            detail_soup = BeautifulSoup(detail_response.content, 'html.parser')
                            
                            # Extract full description
                            description_text = ""
                            requirements_text_scraped = ""
                            
                            # Find all h3 titles and their following content
                            titles_h3 = detail_soup.find_all('h3', class_='details-body__title')
                            
                            for h3 in titles_h3:
                                title_text = h3.get_text(strip=True)
                                content_div = h3.find_next_sibling('div', class_='details-body__content')
                                
                                if content_div:
                                    content = content_div.get_text(separator='\n', strip=True)
                                    
                                    if "Description" in title_text:
                                        description_text = content
                                    elif "Exigences" in title_text or "Requirements" in title_text or "exigences" in title_text.lower():
                                        requirements_text_scraped = content
                            
                            # Combine description and requirements
                            full_description = description_text if description_text else full_description
                            if requirements_text_scraped:
                                requirements_text = requirements_text_scraped
                                if requirements_text not in full_description:
                                    full_description += "\n\nExigences:\n" + requirements_text
                            
                        else:
                            print(f"Failed to load details: {detail_response.status_code}")
                        
                        time.sleep(1) # Be nice
                    except Exception as e:
                        print(f"Error fetching details for {title}: {e}")

                opportunities.append({
                    'title': title[:255],
                    'description': full_description[:2000],
                    'requirements': requirements_text[:500],
                    'location': location[:255],
                    'company_name': company[:255],
                    'source': 'Tanitjobs',
                    'url': job_url
                })
                
                print(f"✓ Scraped: {title[:50]}")
                
            except Exception as e:
                print(f"Error parsing job: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Tanitjobs: {e}")
    
    print(f"Scraped {len(opportunities)} opportunities from Tanitjobs")
    return opportunities


def scrape_keejob(html_content=None):
    """
    Scrape internship opportunities from Keejob
    If html_content is provided, parses that instead of fetching from web.
    Returns list of dicts with opportunity data
    """
    import cloudscraper
    
    opportunities = []
    
    try:
        soup = None
        
        if html_content:
            print("Parsing provided HTML content for Keejob...")
            soup = BeautifulSoup(html_content, 'html.parser')
        else:
            # For now, we only support offline parsing or placeholder for online
            pass
            
        if not soup:
            return opportunities
        
        # Find job listings
        # Based on user HTML: div with class "bg-white dark:bg-gray-700 ..."
        # Using a broader selector to catch the cards
        job_cards = soup.select('div.grid.grid-cols-1 > div')
        
        print(f"Found {len(job_cards)} job listings (candidate blocks)")
        
        valid_cards = 0
        for card in job_cards:
            try:
                # Extract title
                title_elem = card.select_one('h3 a')
                if not title_elem:
                    continue
                
                title = title_elem.get_text(strip=True)
                job_url = title_elem.get('href', '')
                if job_url and not job_url.startswith('http'):
                    job_url = "https://www.keejob.com" + job_url
                
                # Extract company
                company = "Not specified"
                # Looking for company link inside the card
                company_links = card.select('a[href*="/companies/"]')
                if company_links:
                    company = company_links[-1].get_text(strip=True)
                
                # Extract location
                location = "Tunisia"
                location_icon = card.select_one('i.fa-map-marker-alt')
                if location_icon and location_icon.next_sibling:
                    location = location_icon.next_sibling.get_text(strip=True)
                elif location_icon and location_icon.parent:
                     location = location_icon.parent.get_text(strip=True)

                
                # Extract description
                description = ""
                desc_elem = card.select_one('p.text-sm')
                if desc_elem:
                    description = desc_elem.get_text(strip=True)
                
                # Extract tags/requirements
                tags = []
                for tag in card.select('span.inline-flex'):
                    tags.append(tag.get_text(strip=True))
                
                requirements = " | ".join(tags)
                
                full_description = f"{description}\n\nTags: {requirements}\n\nEntreprise: {company}\nLieu: {location}"

                opportunities.append({
                    'title': title[:255],
                    'description': full_description[:2000],
                    'requirements': requirements[:500] if requirements else f"Entreprise: {company}",
                    'location': location[:255],
                    'company_name': company[:255],
                    'source': 'Keejob',
                    'url': job_url
                })
                
                print(f"✓ Scraped: {title[:50]}")
                valid_cards += 1
                
            except Exception as e:
                print(f"Error parsing Keejob card: {e}")
                continue
    
        print(f"Scraped {valid_cards} opportunities from Keejob")
                
    except Exception as e:
        print(f"Error scraping Keejob: {e}")
        import traceback
        traceback.print_exc()
    
    return opportunities
    

def scrape_generic_rss(rss_url, source_name):
    """
    Generic RSS feed scraper for job boards
    Many job sites provide RSS feeds
    """
    opportunities = []
    
    try:
        response = requests.get(rss_url, timeout=10)
        if response.status_code != 200:
            return opportunities
        
        soup = BeautifulSoup(response.content, 'xml')
        items = soup.find_all('item')[:10]
        
        for item in items:
            try:
                title = item.find('title').get_text(strip=True) if item.find('title') else None
                description = item.find('description').get_text(strip=True) if item.find('description') else ""
                
                if not title:
                    continue
                
                # Clean HTML from description
                description = re.sub(r'<[^>]+>', '', description)
                
                opportunities.append({
                    'title': title[:255],
                    'description': description[:1000] or "No description available",
                    'location': "Tunisia",
                    'source': source_name
                })
            except Exception as e:
                print(f"Error parsing RSS item: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping RSS {source_name}: {e}")
    
    return opportunities


def scrape_all_sources(html_content=None):
    """
    Scrape all configured sources and return combined results
    """
    all_opportunities = []
    
    # Scrape from Tanitjobs
    print("🔍 Scraping Tanitjobs...")
    tanitjobs_opps = scrape_tanitjobs(html_content=html_content)
    all_opportunities.extend(tanitjobs_opps)
    
    # Scrape from Keejob
    print("🔍 Scraping Keejob...")
    keejob_opps = scrape_keejob(html_content=html_content)
    all_opportunities.extend(keejob_opps)
    
    # Add more sources here if needed
    # all_opportunities.extend(scrape_generic_rss("https://example.com/jobs.rss", "Example Site"))
    
    print(f"✅ Found {len(all_opportunities)} opportunities total")
    return all_opportunities



def clean_and_validate_opportunity(opp_data):
    """
    Clean and validate scraped opportunity data
    Add defaults and ensure required fields
    """
    # Set default dates (start in 1 month, end in 4 months)
    start_date = timezone.now().date() + timedelta(days=30)
    end_date = start_date + timedelta(days=90)
    
    # Build description with application link
    description_text = opp_data.get('description', 'No description available')
    if opp_data.get('url'):
        description_text += f"\n\n📎 Pour postuler, visitez le lien original: {opp_data.get('url')}"
    
    # Build requirements text
    requirements_text = opp_data.get('requirements', '')
    if not requirements_text:
        requirements_text = f"Source: {opp_data.get('source', 'Web Scraper')}"
    
    # Add company name if available
    if opp_data.get('company_name'):
        requirements_text += f"\nCompany: {opp_data.get('company_name')}"
    
    cleaned = {
        'title': opp_data.get('title', 'Internship Opportunity')[:255],
        'description': description_text[:2000],
        'requirements': requirements_text[:500],
        'type': 'Stage',
        'location': opp_data.get('location', 'Tunisia')[:255],
        'duration': '3 months',
        'start_date': start_date,
        'end_date': end_date,
        'positions_available': 1,
        'status': 0,  # Pending admin approval
        'external_url': opp_data.get('url', ''),  # Store the job URL
    }
    
    return cleaned
