// import express from "express";
// import { faker } from '@faker-js/faker';
// import Car from '../models/Car.js';
//
// const routes = express.Router();
//
// // Middleware om de Acceptheader te controleren voor GET-verzoeken
// const checkAcceptHeader = (req, res, next) => {
//     const acceptHeader = req.get('Accept');
//
//     if (acceptHeader === 'application/json') {
//         // Ga door naar de volgende middleware of route handler als de Accept-header 'application/json' is
//         next();
//     } else {
//         // Stuur een foutmelding als de Accept-header iets anders is dan 'application/json'
//         res.status(406).json({ message: 'Alleen application/json is toegestaan' });
//     }
// };
//
// // Middleware om de Content-Type header te controleren voor POST-verzoeken
// const checkContentTypeHeader = (req, res, next) => {
//     const contentTypeHeader = req.get('Content-Type');
//
//     if (contentTypeHeader === 'application/x-www-form-urlencoded') {
//         // Ga door naar de volgende middleware of route handler
//         next();
//     } else {
//         // Stuur een foutmelding als de Content-Type header iets anders is
//         res.status(415).json({ error: 'Alleen application/json en application/x-www-form-urlencoded zijn toegestaan' });
//     }
// };
//
// function currentItems(total, start, limit) {
//     if (isNaN(start) || isNaN(limit)) {
//         return total;
//     } else {
//         return Math.min(total - start, limit);
//     }
// }
//
// function numberOfPages(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || limit <= 0) {
//         return total;
//     } else {
//         return Math.ceil((total - start) / limit);
//     }
// }
//
// function currentPage(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || limit <= 0) {
//         return 1;
//     } else {
//         return Math.floor(start / limit) + 1;
//     }
// }
//
// function firstPageItem(start) {
//     return isNaN(start) ? 0 : start;
// }
//
// function lastPageItem(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || limit <= 0) {
//         return total;
//     } else {
//         return Math.min(total, start + limit * (Math.ceil(total / limit) - 1));
//     }
// }
//
// function previousPageItem(start, limit) {
//     return Math.max(0, start - limit);
// }
//
// function nextPageItem(start, limit) {
//     return start + limit;
// }
//
// function getFirstQueryString(start, limit) {
//     if (isNaN(start) || isNaN(limit) || start === 0 || limit <= 0) {
//         return '';
//     } else {
//         return `?start=0&limit=${limit}`;
//     }
// }
//
// function getLastQueryString(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || start === total || limit <= 0) {
//         return '';
//     } else {
//         const lastPageStart = (Math.ceil(total / limit) - 1) * limit;
//         return `?start=${lastPageStart}&limit=${limit}`;
//     }
// }
//
// function getPreviousQueryString(start, limit) {
//     if (isNaN(start) || isNaN(limit) || start <= 0 || limit <= 0) {
//         return '';
//     } else {
//         const prevStart = Math.max(0, start - limit);
//         return `?start=${prevStart}&limit=${limit}`;
//     }
// }
//
// function getNextQueryString(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || start + limit >= total || limit <= 0) {
//         return '';
//     } else {
//         const nextStart = start + limit;
//         return `?start=${nextStart}&limit=${limit}`;
//     }
// }
//
// function itemToPageNumber(total, start, limit, itemNumber) {
//     if (isNaN(start) || isNaN(limit) || isNaN(itemNumber) || limit <= 0 || total <= 0 || start >= total) {
//         return 1;
//     }
//
//     if (itemNumber < start) {
//         return 1;
//     }
//
//     const itemsBeforeItemNumber = itemNumber - start;
//     const pageNumber = Math.floor(itemsBeforeItemNumber / limit) + 1;
//
//     return pageNumber;
// }
//
// function createPagination(total, start, limit) {
//     return {
//         currentPage: currentPage(total, start, limit),
//         currentItems: currentItems(total, start, limit),
//         totalPages: numberOfPages(total, start, limit),
//         totalItems: total,
//         firstPageItem: firstPageItem(start),
//         lastPageItem: lastPageItem(total, start, limit),
//         previousPageItem: previousPageItem(start, limit),
//         nextPageItem: nextPageItem(start, limit),
//         firstQueryString: getFirstQueryString(start, limit),
//         lastQueryString: getLastQueryString(total, start, limit),
//         previousQueryString: getPreviousQueryString(start, limit),
//         nextQueryString: getNextQueryString(total, start, limit)
//     };
// }
//
// routes.get("/", checkAcceptHeader, async (req, res) => {
//     try {
//         let start = parseInt(req.query.start) || 0;
//         let limit = parseInt(req.query.limit) || 10;
//
//         const totalItems = await Car.countDocuments({});
//         const pagination = createPagination(totalItems, start, limit);
//
//         const cars = await Car.find({}).skip(start).limit(limit);
//
//         const collection = {
//             items: cars.map(car => ({
//                 ...car.toJSON(),
//                 _links: {
//                     self: `${req.protocol}://${req.get('host')}/cars/${car._id}`
//                 }
//             })),
//             _links: {
//                 self: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
//                 collection: `${req.protocol}://${req.get('host')}/cars`
//             },
//             pagination: pagination
//         };
//         res.status(200).json(collection);
//     } catch (error) {
//         res.status(500).json({ error: "Fout bij het ophalen van auto's" });
//     }
// });
//
//
// // Haal een specifieke auto op basis van ID
// routes.get('/:id', async (req, res) => {
//     try {
//         const car = await Car.findById(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         const carObject = car.toObject();
//
//         const response = {
//             ...carObject,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` },
//                 collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//             }
//         };
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Voeg een nieuwe auto toe aan de collectie
// routes.post('/', checkContentTypeHeader, async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (!name || !about || !type) {
//         res.status(400).json({ message: 'Fields "name", "about", and "type" are required' });
//         return;
//     }
//
//     try {
//         const newCar = await Car.create({
//             name,
//             about,
//             type,
//         });
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(201).json({
//             message: 'Car created successfully',
//             newCar: {
//                 ...newCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${newCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Seed de database met nepauto's
// routes.post('/seed', async (req, res) => {
//     try {
//         // Verifieer of het verzoek de juiste methode (SEED) bevat
//         if (req.body?.METHOD === 'SEED') {
//             // Verwijder alle bestaande auto's
//             await Car.deleteMany({});
//
//             // Voeg nieuwe nepauto's toe aan de database
//             for (let i = 0; i < 10; i++) {
//                 await Car.create({
//                     name: req.body.name || faker.lorem.sentence({ min: 3, max: 10 }),
//                     about: req.body.about || faker.lorem.paragraph(4),
//                     type: req.body.type || faker.lorem.sentence({ min: 3, max: 10 }),
//                 });
//             }
//
//             // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//             res.header('Access-Control-Allow-Origin', '*');
//             res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//
//             // Stuur een succesbericht
//             res.status(201).json({ message: 'Database seeded successfully' });
//         } else {
//             // Verkeerde methode, stuur een foutbericht
//             res.status(400).json({ message: 'Method not implemented' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Update een specifieke auto op basis van ID
// routes.put('/:id', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (name === '' || about === '' || type === '') {
//         res.status(400).json({ message: 'Fields cannot be empty' });
//         return;
//     }
//
//     try {
//         const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
//
//         if (!updatedCar) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.status(200).json({
//             message: 'Car updated successfully',
//             updatedCar: {
//                 ...updatedCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${updatedCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Verwijder een specifieke auto op basis van ID
// routes.delete('/:id', async (req, res) => {
//     try {
//         const car = await Car.findByIdAndDelete(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(204).send();
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // OPTIONS voor de collectie resource
// routes.options("/", (req, res) => {
//     res.header('Allow', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// // OPTIONS detail resource (voor CORS preflight requests)
// routes.options('/:id', (req, res) => {
//     res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*'); // Voeg Access-Control-Allow-Origin toe
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// export default routes;









// import express from "express";
// import { faker } from '@faker-js/faker';
// import Car from '../models/Car.js';
//
// const routes = express.Router();
//
// // Functie om het aantal getoonde items te berekenen
// function currentItems(total, start, limit) {
//     if (isNaN(start) || isNaN(limit)) {
//         return total; // Geen start of limiet, retourneer totaal aantal items
//     } else {
//         const endIndex = start + limit;
//         return endIndex > total ? total : endIndex; // Bereken het aantal items tot de eindindex of totaal aantal items
//     }
// }
//
// // Functie om het aantal pagina's te berekenen
// function numberOfPages(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || limit === 0) {
//         return total; // Geen start of limiet, of limiet is 0, retourneer totaal aantal pagina's
//     } else {
//         return Math.ceil(total / limit); // Bereken het aantal pagina's op basis van het totale aantal items en de limiet
//     }
// }
//
// // Functie om de huidige pagina te berekenen
// function currentPage(total, start, limit) {
//     if (isNaN(start) || isNaN(limit) || limit === 0) {
//         return 1; // Geen start of limiet, of limiet is 0, je zit op pagina 1
//     } else {
//         return Math.ceil(start / limit) + 1; // Bereken op welke pagina je zit op basis van start en limiet
//     }
// }
//
// // Haal alle auto's op met paginering
// routes.get("/", async (req, res) => {
//     const acceptedType = req.accepts('json');
//
//     if (!acceptedType) {
//         res.status(406).json({ message: 'Not Acceptable' });
//         return;
//     }
//
//     const totalItems = await Car.countDocuments({}); // Totaal aantal auto's in de database
//     const start = parseInt(req.query.start); // Haal start uit de query parameters
//     const limit = parseInt(req.query.limit); // Haal limit uit de query parameters
//
//     const currentPageNumber = currentPage(totalItems, start, limit); // Bepaal de huidige pagina
//
//     try {
//         // Bereken pagina-informatie
//         let page = 1;
//         const totalPages = Math.ceil(totalItems / limit); // Bereken het totale aantal pagina's
//
//         if (!isNaN(start) && !isNaN(limit) && limit !== 0) {
//             page = currentPageNumber;
//         }
//
//         // Haal auto's op voor de huidige pagina
//         const startIndex = (page - 1) * limit;
//         const cars = await Car.find({}).skip(startIndex).limit(limit);
//
//         let items = cars.map((car) => {
//             const carObject = car.toObject();
//             return {
//                 ...carObject,
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` }
//                 }
//             };
//         });
//
//         const response = {
//             items: items,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars` }
//             },
//             pagination: {
//                 currentPage: currentPageNumber,
//                 currentItems: items.length,
//                 totalPages: totalPages,
//                 totalItems: totalItems,
//                 _links: {
//                     first: {
//                         page: 1,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=0&limit=${limit}`
//                     },
//                     last: {
//                         page: totalPages,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=${totalItems - limit}&limit=${limit}`
//                     },
//                     previous: page > 1 ? {
//                         page: page - 1,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=${startIndex - limit}&limit=${limit}`
//                     } : null,
//                     next: page < totalPages ? {
//                         page: page + 1,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=${startIndex + limit}&limit=${limit}`
//                     } : null
//                 }
//             }
//         };
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // Haal een specifieke auto op basis van ID
// routes.get('/:id', async (req, res) => {
//     try {
//         const car = await Car.findById(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         const carObject = car.toObject();
//
//         const response = {
//             ...carObject,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` },
//                 collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//             }
//         };
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Voeg een nieuwe auto toe aan de collectie
// routes.post('/', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (!name || !about || !type) {
//         res.status(400).json({ message: 'Fields "name", "about", and "type" are required' });
//         return;
//     }
//
//     try {
//         const newCar = await Car.create({
//             name,
//             about,
//             type,
//         });
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(201).json({
//             message: 'Car created successfully',
//             newCar: {
//                 ...newCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${newCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Seed de database met nepauto's
// routes.post('/seed', async (req, res) => {
//     try {
//         // Verifieer of het verzoek de juiste methode (SEED) bevat
//         if (req.body?.METHOD === 'SEED') {
//             // Verwijder alle bestaande auto's
//             await Car.deleteMany({});
//
//             // Voeg nieuwe nepauto's toe aan de database
//             for (let i = 0; i < 10; i++) {
//                 await Car.create({
//                     name: req.body.name || faker.lorem.sentence({ min: 3, max: 10 }),
//                     about: req.body.about || faker.lorem.paragraph(4),
//                     type: req.body.type || faker.lorem.sentence({ min: 3, max: 10 }),
//                 });
//             }
//
//             // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//             res.header('Access-Control-Allow-Origin', '*');
//             res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//
//             // Stuur een succesbericht
//             res.status(201).json({ message: 'Database seeded successfully' });
//         } else {
//             // Verkeerde methode, stuur een foutbericht
//             res.status(400).json({ message: 'Method not implemented' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Update een specifieke auto op basis van ID
// routes.put('/:id', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (name === '' || about === '' || type === '') {
//         res.status(400).json({ message: 'Fields cannot be empty' });
//         return;
//     }
//
//     try {
//         const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
//
//         if (!updatedCar) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.status(200).json({
//             message: 'Car updated successfully',
//             updatedCar: {
//                 ...updatedCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${updatedCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Verwijder een specifieke auto op basis van ID
// routes.delete('/:id', async (req, res) => {
//     try {
//         const car = await Car.findByIdAndDelete(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(204).send();
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // OPTIONS voor de collectie resource
// routes.options("/", (req, res) => {
//     res.header('Allow', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// // OPTIONS detail resource (voor CORS preflight requests)
// routes.options('/:id', (req, res) => {
//     res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*'); // Voeg Access-Control-Allow-Origin toe
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// export default routes;



// import express from "express";
// import { faker } from '@faker-js/faker';
// import Car from '../models/Car.js';
//
// const routes = express.Router();
//
// // Functie om de querystring voor de vorige pagina te genereren
// const getPreviousQueryString = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return '';
//     } else {
//         const prevStart = Math.max(start - limit, 0);
//         return `?start=${prevStart}&limit=${limit}`;
//     }
// };
//
// // Functie om de querystring voor de volgende pagina te genereren
// const getNextQueryString = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return '';
//     } else {
//         const nextStart = start + limit;
//         return `?start=${nextStart}&limit=${limit}`;
//     }
// };
//
// // Functie om de querystring voor de eerste pagina te genereren
// const getFirstQueryString = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return '';
//     } else {
//         return `?start=0&limit=${limit}`;
//     }
// };
//
// // Functie om de querystring voor de laatste pagina te genereren
// const getLastQueryString = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return '';
//     } else {
//         const lastStart = Math.floor((total - 1) / limit) * limit;
//         return `?start=${lastStart}&limit=${limit}`;
//     }
// };
//
// // Functie om het startnummer van het vorige item op de pagina te berekenen
// const previousPageItem = (total, start, limit) => Math.max(start - limit, 0) + 1;
//
// // Functie om het startnummer van het volgende item op de pagina te berekenen
// const nextPageItem = (total, start, limit) => start + limit + 1;
//
// // Functie om het startnummer van het eerste item op de pagina te berekenen
// const firstPageItem = (total, start, limit) => (isNaN(start) || isNaN(limit)) ? 1 : start + 1;
//
// // Functie om het startnummer van het laatste item op de pagina te berekenen
// const lastPageItem = (total, start, limit) => (isNaN(start) || isNaN(limit)) ? total : Math.min(start + limit, total);
//
// // Functie om de huidige pagina te berekenen
// const currentPage = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return 1;
//     } else {
//         return Math.floor(start / limit) + 1;
//     }
// };
//
// // Functie om het aantal pagina's te berekenen
// const numberOfPages = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return Math.ceil(total / limit);
//     } else {
//         return Math.ceil((total - start) / limit);
//     }
// };
//
// // Functie om het aantal getoonde items in de collectie te berekenen
// const currentItems = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         return total;
//     } else {
//         return Math.min(limit, total - start);
//     }
// };
//
// // Haal alle auto's op met pagination
// routes.get("/", async (req, res) => {
//     const acceptedType = req.accepts('json');
//
//     if (!acceptedType) {
//         res.status(406).json({ message: 'Not Acceptable' });
//         return;
//     }
//
//     try {
//         const cars = await Car.find({});
//
//         // Haal start en limit uit de querystring en zet ze om naar getallen
//         let start = parseInt(req.query.start);
//         let limit = parseInt(req.query.limit);
//
//         // Controleer of start en limit NaN zijn, zo ja, negeer ze
//         if (isNaN(start) || isNaN(limit)) {
//             start = undefined;
//             limit = undefined;
//         }
//
//         let items = cars.map((car) => {
//             const carObject = car.toObject();
//             return {
//                 ...carObject,
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` }
//                 }
//             };
//         });
//
//         // Pas de items aan op basis van start en limit
//         if (!isNaN(start) && !isNaN(limit)) {
//             items = items.slice(start, start + limit);
//         }
//
//         const response = {
//             items: items,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars` }
//             },
//             pagination: {
//                 totalItems: cars.length,
//                 currentItems: currentItems(cars.length, start, limit),
//                 totalPages: numberOfPages(cars.length, start, limit),
//                 currentPage: currentPage(cars.length, start, limit),
//                 firstPageItem: firstPageItem(cars.length, start, limit),
//                 lastPageItem: lastPageItem(cars.length, start, limit),
//                 previousPageItem: previousPageItem(cars.length, start, limit),
//                 nextPageItem: nextPageItem(cars.length, start, limit),
//                 firstQueryString: getFirstQueryString(cars.length, start, limit),
//                 lastQueryString: getLastQueryString(cars.length, start, limit),
//                 previousQueryString: getPreviousQueryString(cars.length, start, limit),
//                 nextQueryString: getNextQueryString(cars.length, start, limit),
//             }
//         };
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // Haal een specifieke auto op basis van ID
// routes.get('/:id', async (req, res) => {
//     try {
//         const car = await Car.findById(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         const carObject = car.toObject();
//
//         const response = {
//             ...carObject,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` },
//                 collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//             }
//         };
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Voeg een nieuwe auto toe aan de collectie
// routes.post('/', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (!name || !about || !type) {
//         res.status(400).json({ message: 'Fields "name", "about", and "type" are required' });
//         return;
//     }
//
//     try {
//         const newCar = await Car.create({
//             name,
//             about,
//             type,
//         });
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(201).json({
//             message: 'Car created successfully',
//             newCar: {
//                 ...newCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${newCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Seed de database met nepauto's
// routes.post('/seed', async (req, res) => {
//     try {
//         // Verifieer of het verzoek de juiste methode (SEED) bevat
//         if (req.body?.METHOD === 'SEED') {
//             // Verwijder alle bestaande auto's
//             await Car.deleteMany({});
//
//             // Voeg nieuwe nepauto's toe aan de database
//             for (let i = 0; i < 10; i++) {
//                 await Car.create({
//                     name: req.body.name || faker.lorem.sentence({ min: 3, max: 10 }),
//                     about: req.body.about || faker.lorem.paragraph(4),
//                     type: req.body.type || faker.lorem.sentence({ min: 3, max: 10 }),
//                 });
//             }
//
//             // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//             res.header('Access-Control-Allow-Origin', '*');
//             res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//
//             // Stuur een succesbericht
//             res.status(201).json({ message: 'Database seeded successfully' });
//         } else {
//             // Verkeerde methode, stuur een foutbericht
//             res.status(400).json({ message: 'Method not implemented' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Update een specifieke auto op basis van ID
// routes.put('/:id', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (name === '' || about === '' || type === '') {
//         res.status(400).json({ message: 'Fields cannot be empty' });
//         return;
//     }
//
//     try {
//         const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
//
//         if (!updatedCar) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.status(200).json({
//             message: 'Car updated successfully',
//             updatedCar: {
//                 ...updatedCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${updatedCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Verwijder een specifieke auto op basis van ID
// routes.delete('/:id', async (req, res) => {
//     try {
//         const car = await Car.findByIdAndDelete(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(204).send();
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // OPTIONS voor de collectie resource
// routes.options("/", (req, res) => {
//     res.header('Allow', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// // OPTIONS detail resource (voor CORS preflight requests)
// routes.options('/:id', (req, res) => {
//     res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*'); // Voeg Access-Control-Allow-Origin toe
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// export default routes;



// import express from "express";
// import { faker } from '@faker-js/faker';
// import Car from '../models/Car.js';
//
// const routes = express.Router();
//
// // Functie om het aantal getoonde items in de collectie te berekenen
// const currentItems = (total, start, limit) => {
//     if (isNaN(start) || isNaN(limit)) {
//         // Als start of limit niet is opgegeven, toon het totale aantal items
//         return total;
//     } else {
//         // Bereken het aantal getoonde items met start en limit
//         const endIndex = start + limit;
//         return endIndex > total ? total : endIndex;
//     }
// };
//
// // Haal alle auto's op met paginering
// routes.get("/", async (req, res) => {
//     const acceptedType = req.accepts('json');
//
//     if (!acceptedType) {
//         res.status(406).json({ message: 'Not Acceptable' });
//         return;
//     }
//
//     try {
//         const cars = await Car.find({});
//         const totalItems = cars.length;
//
//         // Haal start en limit op uit de querystring en zet ze om naar getallen
//         const start = parseInt(req.query.start);
//         const limit = parseInt(req.query.limit);
//
//         // Bereken het aantal getoonde items
//         const shownItems = currentItems(totalItems, start, limit);
//
//         let items = cars.slice(start, shownItems).map((car) => {
//             const carObject = car.toObject();
//             return {
//                 ...carObject,
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` }
//                 }
//             };
//         });
//
//         const response = {
//             items: items,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars` }
//             },
//             pagination: {
//                 currentPage: start || 1,
//                 currentItem: items.length,
//                 totalPages: Math.ceil(totalItems / limit) || 1,
//                 totalItems: totalItems,
//                 _links: {
//                     first: {
//                         page: 1,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=0&limit=${limit}`
//                     },
//                     last: {
//                         page: Math.ceil(totalItems / limit),
//                         href: `${req.protocol}://${req.get('host')}/cars?start=${Math.floor(totalItems / limit) * limit}&limit=${limit}`
//                     },
//                     previous: {
//                         page: start > 1 ? start - 1 : 1,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=${start - limit}&limit=${limit}`
//                     },
//                     next: {
//                         page: start + limit <= totalItems ? start + limit : start,
//                         href: `${req.protocol}://${req.get('host')}/cars?start=${start + limit}&limit=${limit}`
//                     },
//                 }
//             }
//         };
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // Haal een specifieke auto op basis van ID
// routes.get('/:id', async (req, res) => {
//     try {
//         const car = await Car.findById(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         const carObject = car.toObject();
//
//         const response = {
//             ...carObject,
//             _links: {
//                 self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` },
//                 collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//             }
//         };
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(200).json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Voeg een nieuwe auto toe aan de collectie
// routes.post('/', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (!name || !about || !type) {
//         res.status(400).json({ message: 'Fields "name", "about", and "type" are required' });
//         return;
//     }
//
//     try {
//         const newCar = await Car.create({
//             name,
//             about,
//             type,
//         });
//
//         // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(201).json({
//             message: 'Car created successfully',
//             newCar: {
//                 ...newCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${newCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Seed de database met nepauto's
// routes.post('/seed', async (req, res) => {
//     try {
//         // Verifieer of het verzoek de juiste methode (SEED) bevat
//         if (req.body?.METHOD === 'SEED') {
//             // Verwijder alle bestaande auto's
//             await Car.deleteMany({});
//
//             // Voeg nieuwe nepauto's toe aan de database
//             for (let i = 0; i < 10; i++) {
//                 await Car.create({
//                     name: req.body.name || faker.lorem.sentence({ min: 3, max: 10 }),
//                     about: req.body.about || faker.lorem.paragraph(4),
//                     type: req.body.type || faker.lorem.sentence({ min: 3, max: 10 }),
//                 });
//             }
//
//             // Voeg Access-Control-Allow-Origin en Access-Control-Allow-Headers toe
//             res.header('Access-Control-Allow-Origin', '*');
//             res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//
//             // Stuur een succesbericht
//             res.status(201).json({ message: 'Database seeded successfully' });
//         } else {
//             // Verkeerde methode, stuur een foutbericht
//             res.status(400).json({ message: 'Method not implemented' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Update een specifieke auto op basis van ID
// routes.put('/:id', async (req, res) => {
//     const contentType = req.get('Content-Type');
//
//     if (
//         contentType !== 'application/json' &&
//         contentType !== 'application/x-www-form-urlencoded'
//     ) {
//         res.status(415).json({ message: 'Unsupported Media Type' });
//         return;
//     }
//
//     const { name, about, type } = req.body;
//
//     if (name === '' || about === '' || type === '') {
//         res.status(400).json({ message: 'Fields cannot be empty' });
//         return;
//     }
//
//     try {
//         const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
//
//         if (!updatedCar) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.status(200).json({
//             message: 'Car updated successfully',
//             updatedCar: {
//                 ...updatedCar.toObject(),
//                 _links: {
//                     self: { href: `${req.protocol}://${req.get('host')}/cars/${updatedCar._id}` },
//                     collection: { href: `${req.protocol}://${req.get('host')}/cars` }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
// // Verwijder een specifieke auto op basis van ID
// routes.delete('/:id', async (req, res) => {
//     try {
//         const car = await Car.findByIdAndDelete(req.params.id);
//
//         if (!car) {
//             return res.status(404).json({ message: 'Car not found' });
//         }
//
//         res.header('Access-Control-Allow-Origin', '*');
//         res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Voeg Access-Control-Allow-Headers toe
//         res.status(204).send();
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });
//
//
// // OPTIONS voor de collectie resource
// routes.options("/", (req, res) => {
//     res.header('Allow', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// // OPTIONS detail resource (voor CORS preflight requests)
// routes.options('/:id', (req, res) => {
//     res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Origin', '*'); // Voeg Access-Control-Allow-Origin toe
//     res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.sendStatus(200);
// });
//
// export default routes;