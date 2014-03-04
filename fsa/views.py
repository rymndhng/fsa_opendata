import json
import random

from django.http import HttpResponse
from django.shortcuts import render_to_response

from fsa.models import Record, School, District

def index(request):
    return HttpResponse("Hello World!")

def line_chart(request):
    schools = School.objects.all()
    districts = District.objects.all()
    data_dict = {"schools": schools, "districts": districts}
    return render_to_response("index.html", data_dict)


def data(request):
    school_id = int(request.GET['school_id'])
    #fsa_skill_code = request.GET['fsa_skill_code']
    fsa_skill_code = "Numeracy"
    #grade = int(request.GET['grade'])
    grade = 7
    sub_population = "ALL STUDENTS"

    response_data = [record.to_dict() for record in Record.objects.filter(sub_population=sub_population, fsa_skill_code=fsa_skill_code, grade=grade, school_id=school_id)]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def districts(request):
    response_data = [(d.id, d.name) for d in District.objects.all()]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def schools(request, district_id):
    response_data = [(s.id, s.name) for s in School.objects.filter(district_id=district_id)]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def complicated(request):
    response_data = [record.to_dict() for record in Record.objects.filter(district_name="Vancouver", sub_population__in=["ALL STUDENTS"], fsa_skill_code__in=["Numeracy", "Reading"], grade=7)[:100]]
    return HttpResponse(json.dumps(response_data), content_type="application/json")
