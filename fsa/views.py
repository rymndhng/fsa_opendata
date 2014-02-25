import json
import random

from django.http import HttpResponse
from django.shortcuts import render_to_response

from fsa.models import Record

def line_chart(request):
    return render_to_response("index.html")

def data(request):
    response_data = [record.to_dict() for record in Record.objects.filter(district_name="Vancouver", sub_population__in=["ALL STUDENTS"], fsa_skill_code="Numeracy", grade=7)[:10]]
    return HttpResponse(json.dumps(response_data), content_type="application/json")

def complicated(request):
    response_data = [record.to_dict() for record in Record.objects.filter(district_name="Vancouver", sub_population__in=["ALL STUDENTS"], fsa_skill_code__in=["Numeracy", "Reading"], grade=7)[:100]]
    return HttpResponse(json.dumps(response_data), content_type="application/json")
