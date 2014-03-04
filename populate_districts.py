from fsa.models import *

count = 0
for record in Record.objects.all():
    district_name = record.district_name
    school = School.objects.get(id=record.school_id)

    district, created = District.objects.get_or_create(name=district_name)

    record.district_id = district.id
    record.save()

    school.district_id = district.id
    school.save()

    count += 1
    if count % 1000 == 0:
        print "Processing record %s" % count
