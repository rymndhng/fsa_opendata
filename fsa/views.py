import json
import random
import time

from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.views.decorators.gzip import gzip_page


from fsa.models import SchoolRecord, DistrictRecord, SchoolMetadata

def index(request):
    return HttpResponse("Hello World!")


# Interested school districts in lower mainland ish
metrocoast_min = 37
metrocoast_max = 41
VANCOUER_DISTRICT_ID = 39

def line_chart(request):
    """ Prepares the linechart. We're going to be biased and return the records
    which are related to the lower mainland """

    # interested only in district name and address
    filters = {
            'sub_population': "ALL STUDENTS",
            'fsa_skill_code': "Numeracy",
            'grade': 7,
            'district_number': VANCOUER_DISTRICT_ID
            }

    bc_stats = [record.to_dict() for record in DistrictRecord.objects.filter(**filters)]

    data_dict = {'vancouver_stats': json.dumps(bc_stats)}
    return render_to_response("index.html", data_dict)

def data(request):
    district_id = int(request.GET['district_id'])
    school_name = request.GET['school_name']

    filters = {
            'sub_population': "ALL STUDENTS",
            'fsa_skill_code': "Numeracy",
            'grade': 7,
            'district_number': district_id,
            'school_name': school_name
            }

    response_data = [record.to_dict() for record in SchoolRecord.objects.filter(**filters)]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def districts(request):
    # interested only in district's number and name
    districts = DistrictRecord.objects.raw(
                    'select id, district_name, district_number FROM fsa_districtrecord WHERE district_number >= %s AND district_number <= %s GROUP BY district_number',
                    [metrocoast_min,metrocoast_max])

    response_data = [(d.district_number, d.district_name) for d in districts]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def schools(request, district_id):
    # Returns school record in addition to attached parameters
    filters = {
            "district_number": district_id,
            "school_facility_type": "Standard",
            "has_elementary_grades_flag": True,
            "school_year": "2013/2014"}

    response_data = [s.to_dict() for s in SchoolMetadata.objects.filter(**filters)]
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@gzip_page
def coast_school_meta(request):
    # elementary schools in coast
    schools = SchoolMetadata.objects \
                .filter(district_number__gte = metrocoast_min,
                        district_number__lte = metrocoast_max,
                        school_facility_type__exact = "Standard",
                        has_elementary_grades_flag__exact = True,
                        school_year__exact = "2013/2014")

    response_data = [s.to_dict() for s in schools]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def complicated(request):
    response_data = [record.to_dict() for record in Record.objects.filter(district_name="Vancouver", sub_population__in=["ALL STUDENTS"], fsa_skill_code__in=["Numeracy", "Reading"], grade=7)[:100]]
    return HttpResponse(json.dumps(response_data), content_type="application/json")
