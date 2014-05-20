from fsa.models import Record as FsaRecord
import logging
import sys

def parse_datafile(filename):
    with open(filename) as f:
        # Figure out index of fields of interest
        raw_field_names = {'District Name', 'School Year', 'School Name', 'Sub Population', 'Grade', 'Fsa Skill Code', 'Number Writers', 'Score', 'Participation Rate'}
        headers = f.readline().strip().split("\t")

        field_name_to_idx = {}
        for raw_field_name in raw_field_names:
            field_name = raw_field_name.replace(' ', '_').lower()
            field_name_to_idx[field_name] = headers.index(raw_field_name)

        count = 0
        for line in f:
            try:
                count += 1
                if count % 1000 == 0:  print "Importing record #%s" % count
                data_dict = {}
                line_clean = line.strip().split("\t")
                for field_name, field_idx in field_name_to_idx.iteritems():
                    field_value = None
                    if field_name == 'score':
                        field_value = int(float(line_clean[field_idx]))
                    else:
                        field_value = line_clean[field_idx]
                    data_dict[field_name] = field_value
                FsaRecord.objects.create(**data_dict)
            except:
                pass

if __name__ == '__main__':
    parse_datafile("raw_data/Foundation_Skills_Assessment_2012-2013_Schools_Only.txt")
