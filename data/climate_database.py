__author__ = 'scottsfarley'
import json
import pprint

sites = {}

cd = json.load(open("climate_dump.json"))
cd = cd['ET_']
print cd.keys()