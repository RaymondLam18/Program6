import express from "express";
import { faker } from '@faker-js/faker';
import Car from '../models/Car.js';

const routes = express.Router();

function currentItems(total, start, limit) {
    if (isNaN(start) || isNaN(limit)) {
        return total;
    } else {
        return Math.min(total - start, limit);
    }
}

function numberOfPages(total, start, limit) {
    if (isNaN(start) || isNaN(limit) || limit <= 0) {
        return total;
    } else {
        return Math.ceil((total - start) / limit);
    }
}

function currentPage(total, start, limit) {
    if (isNaN(start) || isNaN(limit) || limit <= 0) {
        return 1;
    } else {
        return Math.floor(start / limit) + 1;
    }
}

function firstPageItem(start) {
    return isNaN(start) ? 0 : start;
}

function lastPageItem(total, start, limit) {
    if (isNaN(start) || isNaN(limit) || limit <= 0) {
        return total;
    } else {
        return Math.min(total, start + limit * (Math.ceil(total / limit) - 1));
    }
}

function previousPageItem(start, limit) {
    return Math.max(0, start - limit);
}

function nextPageItem(start, limit) {
    return start + limit;
}

function getFirstQueryString(start, limit) {
    if (isNaN(start) || isNaN(limit) || start === 1 || limit <= 0) {
        return '';
    } else {
        const firstPageStart = 1;
        return `?start=${firstPageStart}&limit=${limit}`;
    }
}

function getLastQueryString(total, start, limit) {
    if (isNaN(start) || isNaN(limit) || start === total || limit <= 0) {
        return '';
    } else {
        const lastPageStart = Math.max(0, Math.floor(total / limit) * limit);
        return `?start=${lastPageStart}&limit=${limit}`;
    }
}

function getPreviousQueryString(start, limit) {
    if (isNaN(start) || isNaN(limit) || start <= 0 || limit <= 0) {
        return '';
    } else {
        const prevStart = Math.max(0, start - limit);
        return `?start=${prevStart}&limit=${limit}`;
    }
}

function getNextQueryString(total, start, limit) {
    if (isNaN(start) || isNaN(limit) || start + limit >= total || limit <= 0) {
        return '';
    } else {
        const nextStart = start + limit;
        return `?start=${nextStart}&limit=${limit}`;
    }
}

function itemToPageNumber(total, start, limit, itemNumber) {
    if (isNaN(start) || isNaN(limit) || isNaN(itemNumber) || limit <= 0 || itemNumber < 0 || itemNumber >= total) {
        return -1;
    }

    const adjustedStart = start >= total ? total - 1 : start;

    const pageContainingItem = Math.floor((itemNumber - adjustedStart) / limit);

    if (pageContainingItem >= 0 && pageContainingItem < Math.ceil(total / limit)) {
        return pageContainingItem + 1;
    } else {
        return -1;
    }
}

function createPagination(total, start, limit) {
    return {
        currentPage: currentPage(total, start, limit),
        currentItems: currentItems(total, start, limit),
        totalPages: numberOfPages(total, start, limit),
        totalItems: total,
        firstPageItem: firstPageItem(start),
        lastPageItem: lastPageItem(total, start, limit),
        previousPageItem: previousPageItem(start, limit),
        nextPageItem: nextPageItem(start, limit),
        firstQueryString: getFirstQueryString(start, limit),
        lastQueryString: getLastQueryString(total, start, limit),
        previousQueryString: getPreviousQueryString(start, limit),
        nextQueryString: getNextQueryString(total, start, limit),
    };
}

routes.get("/", async (req, res) => {
    const acceptedType = req.accepts('json');

    if (!acceptedType) {
        res.status(406).json({ message: 'Not Acceptable' });
        return;
    }

    try {

        const totalItems = await Car.countDocuments({});
        const start = parseInt(req.query.start);
        const limit = parseInt(req.query.limit);
        const itemNumber = parseInt(req.query.item);


        const pagination = createPagination(totalItems, start, limit);

        const cars = await Car.find({}).skip(start).limit(limit);


        let items = cars.map((car) => {
            const carObject = car.toObject();
            return {
                ...carObject,
                _links: {
                    self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` }
                }
            };
        });

        const response = {
            items: items,
            _links: {
                self: { href: `${req.protocol}://${req.get('host')}/cars` }
            },
            pagination: {
                currentPage: pagination.currentPage,
                currentItems: pagination.currentItems,
                totalPages: pagination.totalPages,
                totalItems: pagination.totalItems,
                _links: {
                    first: {
                        page: 1,
                        href: `${req.protocol}://${req.get('host')}/cars${pagination.firstQueryString}`
                    },
                    last: {
                        page: pagination.totalPages,
                        href: `${req.protocol}://${req.get('host')}/cars${pagination.lastQueryString}`
                    },
                    previous: pagination.previousQueryString !== '' ? {
                        page: pagination.currentPage - 1,
                        href: `${req.protocol}://${req.get('host')}/cars${pagination.previousQueryString}`
                    } : null,
                    next: pagination.nextQueryString !== '' ? {
                        page: pagination.currentPage + 1,
                        href: `${req.protocol}://${req.get('host')}/cars${pagination.nextQueryString}`
                    } : null,
                    item: itemNumber ? {
                        page: itemToPageNumber(totalItems, start, limit, itemNumber),
                        href: `${req.protocol}://${req.get('host')}/cars?start=${start}&limit=${limit}&item=${itemNumber}`
                    } : null
                }
            }
        };

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


routes.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        const carObject = car.toObject();

        const response = {
            ...carObject,
            _links: {
                self: { href: `${req.protocol}://${req.get('host')}/cars/${car._id}` },
                collection: { href: `${req.protocol}://${req.get('host')}/cars` }
            }
        };

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

routes.post('/', async (req, res) => {
    const contentType = req.get('Content-Type');

    if (
        contentType !== 'application/json' &&
        contentType !== 'application/x-www-form-urlencoded'
    ) {
        res.status(415).json({ message: 'Unsupported Media Type' });
        return;
    }

    const { name, about, type } = req.body;

    if (!name || !about || !type) {
        res.status(400).json({ message: 'Fields "name", "about", and "type" are required' });
        return;
    }

    try {
        const newCar = await Car.create({
            name,
            about,
            type,
        });

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(201).json({
            message: 'Car created successfully',
            newCar: {
                ...newCar.toObject(),
                _links: {
                    self: { href: `${req.protocol}://${req.get('host')}/cars/${newCar._id}` },
                    collection: { href: `${req.protocol}://${req.get('host')}/cars` }
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

routes.post('/seed', async (req, res) => {
    try {
        if (req.body?.METHOD === 'SEED') {
            await Car.deleteMany({});

            for (let i = 0; i < 10; i++) {
                await Car.create({
                    name: req.body.name || faker.lorem.sentence({ min: 3, max: 10 }),
                    about: req.body.about || faker.lorem.paragraph(4),
                    type: req.body.type || faker.lorem.sentence({ min: 3, max: 10 }),
                });
            }

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            res.status(201).json({ message: 'Database seeded successfully' });
        } else {
            res.status(400).json({ message: 'Method not implemented' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

routes.put('/:id', async (req, res) => {
    const contentType = req.get('Content-Type');

    if (
        contentType !== 'application/json' &&
        contentType !== 'application/x-www-form-urlencoded'
    ) {
        res.status(415).json({ message: 'Unsupported Media Type' });
        return;
    }

    const { name, about, type } = req.body;

    if (name === '' || about === '' || type === '') {
        res.status(400).json({ message: 'Fields cannot be empty' });
        return;
    }

    try {
        const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.status(200).json({
            message: 'Car updated successfully',
            updatedCar: {
                ...updatedCar.toObject(),
                _links: {
                    self: { href: `${req.protocol}://${req.get('host')}/cars/${updatedCar._id}` },
                    collection: { href: `${req.protocol}://${req.get('host')}/cars` }
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

routes.delete('/:id', async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

routes.options("/", (req, res) => {
    res.header('Allow', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

routes.options('/:id', (req, res) => {
    res.header('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

export default routes;