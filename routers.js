const express = require("express");
const util = require('./util');
const { check, validationResult } = require('express-validator');
const procUrl = require('./ProcessUrl');
const router = express.Router();
const topics = require('./topics.json')


//Se definen las rutas de app
router.get('/', (req, res) => {
	res.render('index.ejs', { errors: null, result: null });
});

router.get('/training', (req, res) => {
	res.render('training.ejs', {
		errors: null,
		data: {
			title: "",
			keywords: "",
			description: ""
		},
		topics: topics
	});
});

router.post('/do', [check('inputUrl').isURL().withMessage('URL inválida.')], (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(422).render('index.ejs', {
			errors: errors.array(),
			result: null
		});
	}

	let url = req.body.inputUrl;
	procUrl(url, (err, result) => {
		if (err) {
			console.error(err);
		} else {
			let objData = {
				title: util.getTerms(result.title, /[\s, ]+/),
				keywords: util.getTerms(result.keywords, /[\s, ]+/),
				description: util.getTerms(result.description, /[\s, ]+/)
			};

			util.queryClassification(objData, (err, result) => {
				if (err) {
					let listErrors = [{ msg: "Error al consultar clasificación: " + err }]
					return res.status(422).render('index.ejs', {
						errors: listErrors,
						result: null
					})
				}

				let index = topics.findIndex(item => item.topic === result.topic);

				if (index !== -1) {
					result.topic = topics[index].title;
				}

				result.url = url;

				res.render('index.ejs', {
					errors: null,
					result: result
				});

			});
		}

	});

});

router.post('/doTraining', [check('inputUrl').isURL().withMessage('URL inválida.')], (req, res) => {

	let url = req.body.inputUrl;

	if (req.body.actionBtn === 'Analizar') {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).render('training.ejs', {
				errors: errors.array(),
				data: { title: "", keywords: "", description: "" },
				topics: topics
			});
		}

		procUrl(url, (err, result) => {
			if (err) {
				console.error(err);
			} else {
				let properties = {
					url: url,
					title: util.getTerms(result.title, /[\s, ]+/),
					keywords: util.getTerms(result.keywords, /[\s, ]+/),
					description: util.getTerms(result.description, /[\s, ]+/)
				}

				res.render('training.ejs', { data: properties, errors: null, topics: topics });
			}
		});

	} else if (req.body.actionBtn === 'Clasificar') {

		let objData = {
			url: url,
			title: req.body.inputTitle,
			keywords: req.body.inputKeywords,
			description: req.body.inputDescription,
			topic: req.body.listTopics
		}

		let properties = objData.title + objData.keywords + objData.description;

		if (properties === null || properties === "") {
			let err = [{
				msg: 'Se debe especificar alguna carácteristica ("title", "keywords" o "description")'
					+ ' de la pagina para poder clasificarla.'
			}]
			return res.status(422).render('training.ejs', {
				errors: err,
				data: objData,
				topics: topics
			});
		}

		if (req.body.listTopics === "") {
			let err = [{ msg: "No se ha especificado un topico de clasificación." }]
			return res.status(422).render('training.ejs', {
				errors: err,
				data: objData,
				topics: topics
			});
		}

		try {
			util.saveCaseTraining(objData);
		} catch (error) {
			let err = [{ msg: "Error al guardar caso. Err: " + error }];
			return res.status(422).render('training.ejs', {
				errors: err,
				data: objData,
				topics: topics
			});
		}

		objData.url = "";
		objData.title = "";
		objData.keywords = "";
		objData.description = "";

		res.render('training.ejs', { errors: null, data: objData, topics: topics });
	}
});

router.get('/about', (req, res) => {
	res.render('about.ejs');

});

module.exports = router;