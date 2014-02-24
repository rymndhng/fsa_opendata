from django.db import models
from django.db.models import IntegerField, CharField


class Record(models.Model):
    school_year = CharField(max_length=20)
    district_name = CharField(max_length=100)
    school_name = CharField(max_length=100)
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
        return data
