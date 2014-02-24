import json

from django.http import HttpResponse

from fsa.models import FsaRecord


def home(request):
    response_data = [record.to_dict() for record in FsaRecord.objects.filter(district_name="Vancouver", sub_population__in=["ALL STUDENTS"], fsa_skill_code="Numeracy", grade=7)[:55]]
    return HttpResponse(json.dumps(response_data), content_type="application/json")


def complicated(request):
    response_data = [record.to_dict() for record in FsaRecord.objects.filter(district_name="Vancouver", sub_population__in=["ALL STUDENTS"], fsa_skill_code__in=["Numeracy", "Reading"], grade=7)[:100]]
    return HttpResponse(json.dumps(response_data), content_type="application/json")
