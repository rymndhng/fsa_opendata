from django.db import models
from django.db.models import IntegerField, CharField, BooleanField, FloatField

# parent record
class DistrictInfo(models.Model):
    """ Contains shared district level fields """

    class Meta:
        abstract = True

    district_number = IntegerField(db_index=True)
    district_name = CharField(max_length=50)


class CommonRecord(models.Model):
    """ Contains the record - level fields """

    class Meta:
        abstract = True

    school_year = CharField(max_length=20)
    public_or_independent = CharField(max_length=22)
    sub_population = CharField(max_length=23)
    fsa_skill_code = CharField(max_length=50)
    grade = IntegerField()
    number_expected_writers = IntegerField(null=True)
    number_writers = IntegerField(null=True)
    number_unknown = IntegerField(null=True)
    percent_unknown = FloatField(null=True)
    number_below = IntegerField(null=True)
    percent_below = FloatField(null=True)
    number_meeting = IntegerField(null=True)
    percent_meeting = FloatField(null=True)
    number_exceeding = IntegerField(null=True)
    percent_exceeding = FloatField(null=True)
    number_meet_or_exceed = IntegerField(null=True)
    percent_meet_or_exceed = FloatField(null=True)
    score_type = CharField(max_length=25, null=True)
    score = FloatField(null=True)
    participation_rate = IntegerField(null=True)

    def to_dict(self):
        data = {}
        for field_name in self._meta.get_all_field_names():
            data[field_name] = getattr(self, field_name)
        return data


################################################################################
#
#                       Concrete Models
#
################################################################################

class ProvincialRecord(CommonRecord):
    pass


class DistrictRecord(DistrictInfo, CommonRecord):
    pass


class SchoolRecord(DistrictInfo, CommonRecord):
    school_name = CharField(max_length = 50)
    school_number = IntegerField()


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

    def to_dict(self):
        data = {}
        for field_name in self._meta.get_all_field_names():
            data[field_name] = getattr(self, field_name)
        return data
