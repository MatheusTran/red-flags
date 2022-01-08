def jsonify(text):
    with open(text, "r") as file:
        thing = list(file)
        last = len(thing)-1
        for i,x in enumerate(thing):
            card = x.replace("\n", "").replace("/ ", "\\n \\n").replace('"', '\\"')
            if "Custom" in x or "___" in x:
                json.write('        {'+f'"text":"{card}", ' + '"Custom": true}' + (", \n" if i != last else "\n"))
            else:
                json.write('        {'+f'"text":"{card}", ' + '"Custom": false}' + (", \n" if i != last else "\n"))

with open("cards.json", "w") as json:
    json.write('{ \n    "red": [ \n')
    jsonify("flags.txt") 
    json.write('    ],\n    "white":[ \n')
    jsonify("perks.txt")
    json.write('    ]\n}')

print("complete")