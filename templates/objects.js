module.exports = [
	{
		"type": "object",
		"name" : "wooden chair",
		"description" : "A wooden chair.",
		"material" : "wood",
		"weight" : 10,
		"size": 1,
		"tags" : ["chair", "furniture", "seat", "sittable"],
	},
	{
		"type": "object",
		"name" : "wooden table",
		"description" : "A wooden table.",
		"material" : "wood",
		"weight" : 20,
		"size": 2,
		"tags" : ["furniture",],
		"contents" : [], // TODO: How can we place items on a table?
	},
	{
		"type": "object",
		"name" : "chest",
		"description" : "A small wooden chest.",
		"material" : "wood",
		"weight" : 5,
		"size": 0.5,
		"tags" : ["openable"],
		"open" : false,
		"contents" : [],
	},
]