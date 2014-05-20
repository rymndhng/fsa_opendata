import sys
import os
sys.path.append(os.path.join(os.path.dirname(os.path.realpath(__file__)), os.pardir))

from fsa.models import SchoolMetadata as SchoolMetadata
import logging

def parse_schoolmeta(filename):
    with open(filename) as f:
        # the list of interested fields from the file
        raw_field_names = {'SCHOOL_YEAR','PUBLIC_OR_INDEPENDENT','DISTRICT_NUMBER','DISTRICT_LONG_NAME_THIS_ENROL','SCHOOL_NUMBER','SCHOOL_NAME','SCHOOL_FACILITY_TYPE','SCHOOL_PHYSICAL_ADDRESS','SCHOOL_CITY','SCHOOL_PROVINCE','SCHOOL_POSTAL_CODE','SCHOOL_PHONE_NUMBER','SCHOOL_FAX_NUMBER','SCHOOL_LATITUDE','SCHOOL_LONGITUDE','ORGANIZATION_EDUCATION_LEVEL','GRADE_STRING','HAS_ELEMENTARY_GRADES_FLAG','HAS_SECONDARY_GRADES_FLAG'}
        headers = f.readline().strip().split("\t")

        field_name_to_index = {}
        for raw_field_name in  raw_field_names:
            field_name = raw_field_name.lower()
            field_name_to_index[field_name] = headers.index(raw_field_name)

        count = 0
        for line in f:
            try:
                count += 1
                if count % 1000 == 0:
                    print "Importing records #%s" % count
                data_dict = {}
                line_clean = line.strip().split("\t")
                for field_name, field_idx in field_name_to_index.iteritems():
                    field_value = line_clean[field_idx]
                    data_dict[field_name] = field_value
                SchoolMetadata.objects.create(**data_dict)
            except Exception as e:
                print str(e)
                pass

if __name__ == '__main__':
    parse_schoolmeta("raw_data/SchoolLocations_Hist.txt")

# Then run this query to delete (?)
# select a.id, a.district_number, a.school_name, a.school_year  from fsa_schoolmetadata a join (select district_number,school_name, max(school_year) as school_year from fsa_schoolmetadata where district_number = 39 group by district_number,school_name) t ON a.district_number = t.district_number and a.school_name  = t.school_name and a.school_year = t.school_year;
