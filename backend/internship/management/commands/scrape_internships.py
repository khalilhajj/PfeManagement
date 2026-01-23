"""
Management command to manually trigger internship scraping
Usage: python manage.py scrape_internships
"""

from django.core.management.base import BaseCommand
from internship.tasks import scrape_internship_opportunities


class Command(BaseCommand):
    help = 'Manually scrape internship opportunities from external sources'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to HTML file to parse instead of scraping online'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting internship scraping...'))
        
        html_content = None
        if options['file']:
            file_path = options['file']
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    html_content = f.read()
                self.stdout.write(f"📂 Reading from file: {file_path}")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error reading file: {e}"))
                return
        
        result = scrape_internship_opportunities(html_content=html_content)
        
        self.stdout.write(self.style.SUCCESS(f'\n{result}'))
        self.stdout.write(self.style.SUCCESS('\n✅ Scraping completed!'))
