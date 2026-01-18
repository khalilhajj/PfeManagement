from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Soutenance, InternshipOffer
from .scrapers import scrape_all_sources, clean_and_validate_opportunity

User = get_user_model()

@shared_task
def check_soutenance_status():
    """
    Periodic task to check for planned soutenances that have passed.
    Marks them as 'Done'.
    """
    now = timezone.now()
    today = now.date()
    
    # Update Planned soutenances where date < today
    # OR date == today and time < now.time()
    
    # Simple approach: If date is in the past, mark as Done.
    # For today, we might wait until tomorrow or check time.
    # Let's say if date < today, it is definitely done.
    
    updated_count = Soutenance.objects.filter(
        status='Planned',
        date__lt=today
    ).update(status='Done')
    
    return f"Updated {updated_count} past soutenances to Done."


@shared_task
def scrape_internship_opportunities():
    """
    Periodic task to scrape internship opportunities from external sources
    Runs daily to find new opportunities
    """
    print("🤖 Starting internship scraping task...")
    
    try:
        # Get the 'company' user for scraped opportunities
        try:
            company_user = User.objects.get(username='company')
        except User.DoesNotExist:
            print("❌ Error: User 'company' not found. Please create this user first.")
            return "Error: company user not found"
        
        # Scrape opportunities from all sources
        opportunities = scrape_all_sources()
        
        created_count = 0
        duplicate_count = 0
        
        for opp_data in opportunities:
            # Clean and validate data
            cleaned_data = clean_and_validate_opportunity(opp_data)
            
            # Check for duplicates (by title and company within last 7 days)
            existing = InternshipOffer.objects.filter(
                title__iexact=cleaned_data['title'],
                company=company_user,
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).exists()
            
            if existing:
                duplicate_count += 1
                continue
            
            # Create new offer
            InternshipOffer.objects.create(
                company=company_user,
                **cleaned_data
            )
            created_count += 1
        
        result = f"✅ Scraping complete! Created: {created_count}, Duplicates skipped: {duplicate_count}"
        print(result)
        return result
        
    except Exception as e:
        error_msg = f"❌ Error in scraping task: {str(e)}"
        print(error_msg)
        return error_msg
