import codecs
import glob
import json
import os

from lxml import etree

u = unicode

data = {"stories": []}
for story in glob.glob('../corpus/*/*-cleaned.txt'):
    meta_file = os.path.join(os.path.dirname(story), 'META.xml')
    meta_info = {}
    with open(meta_file) as xml_file:
        meta = etree.parse(xml_file).getroot()
        for child in meta:
            if child.tag in ('idnumber', 'title', 'author', 'collaborator', 'year_estimate', 'publisher'):
                meta_info[child.tag] = child.text

    with codecs.open(story, encoding='utf-8') as infile:
        idnumber = u(story.split('/')[-2])
        author = u(meta_info.get('author', ''))
        collaborator = u(meta_info.get('collaborator', ''))
        title = u(meta_info['title'])
        text = infile.read()
        publisher = u(meta_info.get('publisher'))
        year = int(meta_info['year_estimate'])
        data['stories'].append({'idnumber': idnumber, 'author': author, 'collaborator': collaborator,
                                'title': title.split('/')[0], 'body': text, 'publisher': publisher, 'year': year})

with open("static/js/RRH.json", "w") as out:
    json.dump(data, out)