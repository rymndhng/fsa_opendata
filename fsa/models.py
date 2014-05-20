from django.db import models
from django.db.models import IntegerField, CharField, BooleanField


class Record(models.Model):
    school_year = CharField(max_length=20)
    school_id = IntegerField()
    fsa_skill_code = CharField(max_length=50)
    grade = IntegerField()
    sub_population = CharField(max_length=50)
    number_writers = IntegerField()
    participation_rate = IntegerField()
    score = IntegerField()

    def to_dict(self):
        data = {}
        for field_name in self._meta.get_all_field_names():
            data[field_name] = getattr(self, field_name)

        # TODO - Hack! Clean this up
        data['school_name'] = School.objects.get(id=self.school_id).name

        return data

class School(models.Model):
    district_id = IntegerField()
    name = CharField(max_length=100, db_index=True)


class SchoolMetadata(models.Model):
    school_year = CharField(max_length=10)
    public_or_independent = CharField(max_length=20)
    district_number = IntegerField(db_index=True)
    district_long_name_this_enrol = CharField(max_length=50)
    school_number = CharField(max_length=30)
    school_name = CharField(max_length=100)
    school_facility_type = CharField(max_length=50)
    school_physical_address= CharField(max_length=100)
    school_city = CharField(max_length=50)
    school_province = CharField(max_length=50)
    school_postal_code = CharField(max_length=6)
    school_phone_number = CharField(max_length=12)
    school_fax_number = CharField(max_length=12)
    school_latitude = CharField(max_length=12)
    school_longitude = CharField(max_length=12)
    organization_education_level = CharField(max_length=30)
    grade_string = CharField(max_length=6)
    has_elementary_grades_flag = BooleanField()
    has_secondary_grades_flag = BooleanField()


class District(models.Model):
    name = CharField(max_length=100, db_index=True)
