## filter taxa response
import requests
import json

dat = requests.get("http://api.neotomadb.org/v1/data/taxa").json()

res = dat['data']
reducedData = []
for item in res:
    newItem = {}
    newItem['TaxonName'] = item['TaxonName']
    newItem['EcolGroups'] = []
    newItem['TaxonID'] = item['TaxonID']
    newItem['Extinct'] = item['Extinct']
    newItem['TaxaGroupID'] = item['TaxaGroupID']
    print newItem
    reducedData.append(newItem)

json.dump(reducedData, open("taxa.json", 'w'))
