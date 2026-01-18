"""
Web scraping module for internship opportunities
Scrapes job/internship listings from various sources
"""

import cloudscraper
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
from django.utils import timezone
import warnings
import time

# Suppress SSL warnings (only for development/testing)
warnings.filterwarnings('ignore', message='Unverified HTTPS request')
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def scrape_tanitjobs():
    """
    Scrape internship opportunities from Tanitjobs.tn
    Returns list of dicts with opportunity data
    """
    opportunities = []
    
    try:
        # Create a cloudscraper instance to bypass Cloudflare
        scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'linux',
                'mobile': False
            }
        )
        
        # Scrape main page for "Dernières Offres d'emploi"
        url = "https://www.tanitjobs.com/"
        
        print(f"Fetching Tanitjobs main page...")
        response = scraper.get(url, timeout=30)
        
        print(f"Tanitjobs main page status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Failed to fetch main page: {response.status_code}")
            return opportunities
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find job listings - look for "Dernières Offres d'emploi"
        job_cards = soup.find_all('article', class_='listing-item__jobs')
        
        print(f"Found {len(job_cards)} job listings on main page")
        
        for card in job_cards[:10]:  # Limit to 10 jobs
            try:
                # Extract title and URL
                title_elem = card.find('div', class_='listing-item__title')
                if not title_elem:
                    continue
                
                link_elem = title_elem.find('a', class_='link')
                if not link_elem:
                    continue
                
                title = link_elem.get_text(strip=True)
                job_url = link_elem.get('href', '')
                
                if not job_url:
                    continue
                
                # Extract company
                company_elem = card.find('span', class_='listing-item-info-company')
                company = company_elem.get_text(strip=True).replace(' - ', '').strip() if company_elem else "Not specified"
                
                # Extract location
                location_elem = card.find('span', class_='listing-item-info-location')
                location = location_elem.get_text(strip=True) if location_elem else "Tunisia"
                
                # Fetch job details page
                print(f"Fetching details for: {title[:50]}...")
                
                time.sleep(2)  # Be polite to the server
                
                detail_response = scraper.get(job_url, timeout=30)
                
                if detail_response.status_code != 200:
                    print(f"Failed to fetch details (status {detail_response.status_code}), using basic info")
                    # Use basic info without details
                    opportunities.append({
                        'title': title[:255],
                        'description': f"Position at {company}. Location: {location}. Visit {job_url} for more details.",
                        'requirements': f"Company: {company}",
                        'location': location[:255],
                        'company_name': company[:255],
                        'source': 'Tanitjobs',
                        'url': job_url
                    })
                    continue
                
                detail_soup = BeautifulSoup(detail_response.content, 'html.parser')
                
                # Extract full description
                description_text = ""
                requirements_text = ""
                
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
                            requirements_text = content
                
                # Combine description and requirements
                full_description = description_text if description_text else f"Position at {company}"
                if requirements_text and requirements_text not in description_text:
                    full_description += "\n\nExigences:\n" + requirements_text
                
                opportunities.append({
                    'title': title[:255],
                    'description': full_description[:2000],  # Increased limit for full content
                    'requirements': requirements_text[:500] if requirements_text else f"Company: {company}",
                    'location': location[:255],
                    'company_name': company[:255],
                    'source': 'Tanitjobs',
                    'url': job_url
                })
                
                print(f"✓ Scraped: {title[:50]}...")
                
            except Exception as e:
                print(f"Error parsing Tanitjobs job: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Tanitjobs: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"Scraped {len(opportunities)} opportunities from Tanitjobs")
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


def scrape_all_sources():
    """
    Scrape all configured sources and return combined results
    """
    all_opportunities = []
    
    # Scrape from Tanitjobs only
    print("🔍 Scraping Tanitjobs...")
    all_opportunities.extend(scrape_tanitjobs())
    
    # Add more sources here if needed
    # all_opportunities.extend(scrape_generic_rss("https://example.com/jobs.rss", "Example Site"))
    
    # If no opportunities found, add sample demo data (for testing/demo purposes)
    if len(all_opportunities) == 0:
        print("⚠️ No opportunities scraped, adding demo data...")
        all_opportunities = generate_demo_opportunities()
    
    print(f"✅ Found {len(all_opportunities)} opportunities total")
    return all_opportunities


def generate_demo_opportunities():
    """
    Generate demo/sample opportunities for testing
    This runs when actual scraping fails
    
    NOTE: Tanitjobs uses Cloudflare protection which blocks automated scraping.
    For production, consider:
    1. Using Selenium with undetected-chromedriver
    2. Manual API integration (if available)
    3. Manual data entry through admin panel
    """
    demo_opportunities = [
        {
            'title': 'Stage PFE : Conception et Développement d\'une Application Mobile',
            'description': '''Objectifs du stage: Concevoir et développer une application mobile Android offrant les fonctionnalités suivantes :
- Envoi de SMS et lancement d'appels téléphoniques
- Analyse automatique des SMS reçus et déclenchement de notifications
- Visualisation de données sur une carte (position actuelle, historique)
- Gestion d'un parc d'appareils

Missions:
- Analyse des besoins fonctionnels et rédaction des spécifications
- Conception de l'architecture logicielle
- Développement de l'application mobile
- Implémentation des mécanismes de communication
- Intégration des fonctionnalités de cartographie
- Mise en place d'une stratégie de tests''',
            'requirements': '''Technologies: Android natif (Kotlin), Architecture MVVM, API REST, Base de données locale, Google Maps SDK

Profil recherché:
- Étudiant(e) en dernière année d'ingénieur ou master
- Bonnes bases en programmation (Java/Kotlin)
- Intérêt pour le développement mobile
- Autonomie et curiosité technique''',
            'location': 'Ariana, Tunisie',
            'company_name': 'Liss Strike',
            'source': 'Tanitjobs (Demo)',
            'url': 'https://www.tanitjobs.com/job/stage-pfe-conception-developpement-application-mobile/'
        },
        {
            'title': 'Stage PFE : Développement d\'un Chatbot Commercial et SAV Multicanal',
            'description': '''Développement d'un chatbot intelligent pour le service commercial et SAV.

Missions:
- Conception de l'architecture du chatbot
- Développement des fonctionnalités conversationnelles
- Intégration multicanale (web, mobile, réseaux sociaux)
- Mise en place du NLP et machine learning
- Tests et optimisation des réponses automatiques''',
            'requirements': '''Technologies: Python, NLP, TensorFlow/PyTorch, API REST, React

Profil: Étudiant en dernière année ingénieur/master, connaissances en IA/ML, Python''',
            'location': 'Ariana, Tunisie',
            'company_name': 'Liss Strike',
            'source': 'Tanitjobs (Demo)',
            'url': 'https://www.tanitjobs.com/job/stage-pfe-developpement-chatbot-commercial-sav-multicanal/'
        },
        {
            'title': 'PFE – Spring Boot & Angular (Remote)',
            'description': '''Développement d'une application web avec Spring Boot et Angular.

Missions:
- Développement backend avec Spring Boot
- Développement frontend avec Angular
- Intégration des APIs REST
- Tests unitaires et d'intégration
- Déploiement et documentation

Le stage peut être effectué en remote (100% télétravail).''',
            'requirements': '''Technologies: Spring Boot, Angular, PostgreSQL/MySQL, Git

Profil: Étudiant en informatique, connaissances en Java et frameworks web modernes''',
            'location': 'Remote, Tunisie',
            'company_name': 'Kynalix Tech',
            'source': 'Tanitjobs (Demo)',
            'url': 'https://www.tanitjobs.com/job/pfe-spring-boot-angular-remote/'
        },
        {
            'title': 'Stage Data Science & Machine Learning',
            'description': '''Opportunité de stage en Data Science. Travail sur des projets d'analyse de données et machine learning.

Missions:
- Analyse exploratoire des données
- Préparation et nettoyage des datasets
- Développement de modèles ML
- Visualisation des résultats
- Déploiement des modèles en production''',
            'requirements': '''Technologies: Python, Pandas, scikit-learn, TensorFlow, Jupyter

Profil: Connaissances en mathématiques/statistiques, Python, passion pour la data''',
            'location': 'Tunis, Tunisie',
            'company_name': 'Tech Innovators',
            'source': 'Tanitjobs (Demo)',
            'url': 'https://www.tanitjobs.com/job/stage-data-science-machine-learning/'
        },
        {
            'title': 'Stage DevOps & Cloud Computing',
            'description': '''Stage en DevOps avec focus sur AWS/Azure.

Missions:
- Mise en place de pipelines CI/CD
- Conteneurisation avec Docker
- Orchestration avec Kubernetes
- Automatisation de l'infrastructure (IaC)
- Monitoring et logging
- Déploiement cloud (AWS/Azure)

Excellente opportunité d'apprentissage dans un environnement professionnel.''',
            'requirements': '''Technologies: Docker, Kubernetes, Jenkins/GitLab CI, AWS/Azure, Terraform

Profil: Étudiant passionné par le DevOps et l'automatisation''',
            'location': 'Sousse, Tunisie',
            'company_name': 'CloudOps Solutions',
            'source': 'Tanitjobs (Demo)',
            'url': 'https://www.tanitjobs.com/job/stage-devops-cloud-computing/'
        },
    ]
    
    return demo_opportunities


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
