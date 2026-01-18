"""
Management command to manually trigger internship scraping
Usage: python manage.py scrape_internships
"""

from django.core.management.base import BaseCommand
from internship.tasks import scrape_internship_opportunities


class Command(BaseCommand):
    help = 'Manually scrape internship opportunities from external sources'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting internship scraping...'))
        
        result = scrape_internship_opportunities()
        
        self.stdout.write(self.style.SUCCESS(f'\n{result}'))
        self.stdout.write(self.style.SUCCESS('\n✅ Scraping completed!'))
