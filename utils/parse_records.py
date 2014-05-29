""" Set your django environment before running this script!

> os.environ['DJANGO_SETTINGS_MODULE']='mysite.settings'
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))

from fsa.models import ProvincialRecord, DistrictRecord, SchoolRecord
import logging
from django.db.utils import IntegrityError

def parse_datafile(filename):
    with open(filename) as f:
        # This is unnecessary me thinks
        try:
            raw_field_names = {
                    "School Year","Data Level","Public Or Independent",
                    "District Number","District Name","School Number",
                    "School Name","Sub Population","Fsa Skill Code",
                    "Grade","Number Expected Writers","Number Writers",
                    "Number Unknown","Percent Unknown","Number Below",
                    "Percent Below","Number Meeting","Percent Meeting",
                    "Number Exceeding","Percent Exceeding","Number Meet Or Exceed",
                    "Percent Meet Or Exceed","Score Type","Score","Participation Rate"}
            headers = f.readline().strip().split("\t")

            field_name_to_idx = dict()

            for raw_field_name in raw_field_names:
                field_name = raw_field_name.replace(' ', '_').lower()
                field_name_to_idx[field_name] = headers.index(raw_field_name)

            count = 0

            school_records = []
            for line in f:
                count += 1

                if count % 1000 == 0:
                    """ Speed up the insert by bulking school records by 1000"""
                    print "Importing record #%s" % count
                    SchoolRecord.objects.bulk_create(school_records)
                    school_records = []

                data_dict = {}
                line_clean = line.strip().split("\t")

                for field_name, field_idx in field_name_to_idx.iteritems():
                    # skip empty fields which are used when parsing provincial
                    # and district level stuff
                    if not line_clean[field_idx]:
                        continue

                    if line_clean[field_idx] == 'Msk':
                        continue

                    if line_clean[field_idx] == '-':
                        continue

                    field_value = None
                    if field_name in ['district_number', 'school_number', 'grade','number_expected_writers'
                                    'number_writers', 'number_unknown', 'number_below',
                                    'number_meeting','number_exceeding', 'number_meet_or_exceed',
                                    'participation_rate']:
                        field_value = int(line_clean[field_idx])
                    elif field_name in ['score', 'percent_unknown', 'percent_below', 'percent_meeting',
                            'percent_exceeding', 'percent_meet_or_exceed']:
                        field_value = float(line_clean[field_idx])
                    else:
                        field_value = line_clean[field_idx]
                    data_dict[field_name] = field_value

                # -----------------  sanity checks at the end ---------------- #

                # if score is not there don't save it
                if 'score' not in data_dict:
                    continue


                # Choose which type of record to save
                data_level = data_dict['data_level']
                del data_dict['data_level']

                if (data_level == "PROVINCE LEVEL"):
                    ProvincialRecord(**data_dict).save()
                if (data_level == "DISTRICT LEVEL"):
                    DistrictRecord(**data_dict).save()
                if (data_level == "SCHOOL LEVEL"):
                    if 'district_number' not in data_dict:
                        data_dict['district_number'] = 0;
                        data_dict['district_name'] = 'independent';
                    school_records.append(SchoolRecord(**data_dict))

            SchoolRecord.objects.bulk_create(school_records)
        except IntegrityError as e:
            import pdb
            pdb.set_trace()



if __name__ == '__main__':
    print os.getcwd()
    parse_datafile("raw_data/Foundation_Skills_Assessment_2012-2013.txt")
