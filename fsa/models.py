from django.db import models
from django.db.models import IntegerField, CharField


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

class District(models.Model):
    name = CharField(max_length=100, db_index=True)
