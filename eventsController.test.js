const {
  getEventById,
  getEventsByDate,
  getAllEvents,
  getEventsByGroup,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("./eventsController");
const { Event } = require("../models/eventModel");
const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const { date } = require("joi");

// jest.mock('mongoose', () => ({
//   ...jest.requireActual('mongoose'),
//   model: () => ({
//     find: jest.fn(), // Мокируем find метод
//   insertMany: jest.fn(),
//   }),
// }));
jest.mock("../models/eventModel", () => ({
  Event: {
    find: jest.fn(),
    insertMany: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    aggregate: jest.fn(),
    save: jest.fn(),
  },
}));

describe("getAllEvents Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.find.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getAllEvents(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting events: Database error",
    });
  });

  it("должен вернуть 200 и массив тренировок", async () => {
    const mockEvents = [
      {
        _id: "1",
        groupTitle: "Title1",
        groupId: "1",
        isCancelled: false,
        // date: new Date().toISOString(),
        date: "2023-01-02",
        participants: [],
      },
      {
        _id: "2",
        groupTitle: "Title2",
        groupId: "2",
        isCancelled: false,
        //date: new Date().toISOString(),
        date: "2023-01-03",
        participants: [],
      },
    ];
    Event.find.mockResolvedValueOnce(mockEvents); // Мок успешного ответа

    const req = httpMocks.createRequest(); // Мокаем запрос
    const res = httpMocks.createResponse(); // Мокаем ответ

    await getAllEvents(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockEvents); // Проверяем, что вернулись данные
  });
  it("должен вернуть все события при успешном выполнении запроса", async () => {
    const events = [
      {
        _id: "1",
        groupTitle: "groupTitle 1",
        groupId: "1",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
      {
        _id: "2",
        groupTitle: "groupTitle 2",
        groupId: "2",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      },
    ];
    await Event.find.mockResolvedValueOnce(events);

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllEvents(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toHaveLength(events.length);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ groupTitle: "groupTitle 1" }),
        expect.objectContaining({ groupTitle: "groupTitle 2" }),
      ])
    );
  });
  it("должен вернуть пустой массив, если событий нет", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllEvents(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getData().length).toEqual(0);
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getAllEvents(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});

///////////////////////////////////////////////////////////////////////////////

describe("getEventById Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.findById.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getEventById(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting event: Database error",
    });
  });

  it("должен вернуть 200 и тренировку", async () => {
    const mockEvent = {
      _id: "1",
      groupTitle: "Title1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    Event.findById.mockResolvedValueOnce(mockEvent); // Мок успешного ответа

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockEvent); // Проверяем, что вернулись данные
  });
  it("должен вернуть событие при успешном выполнении запроса", async () => {
    const event = {
      _id: "1",
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    await Event.findById.mockResolvedValueOnce(event);

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ groupTitle: "groupTitle 1" }) // Проверяем, что объект содержит нужное поле
    );
  });

  it("должен вернуть пустой массив, если события нет", async () => {
    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(404);
    // console.log(res._getData())
    expect(res._getJSONData()).toEqual({ message: "Event not found" });
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});

/////////////////////////////////////////////////////////////////////////////

describe("getEventsByDate Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.aggregate.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      query: {
        startDate: "2023-01-01",
        endDate: "2023-01-04",
      },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getEventsByDate(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting events: Database error",
    });
  });
  it("должен вернуть 400, если startDate отсутствует", async () => {
    const req = httpMocks.createRequest({
      query: {
        endDate: "2023-01-04", // Только endDate, startDate отсутствует
      },
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getEventsByDate(req, res);

    // Проверяем, что статус 400
    expect(res.statusCode).toBe(400);

    // Проверяем сообщение об ошибке
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Both startDate and endDate are required.",
    });
  });
  it("должен вернуть 400, если endDate отсутствует", async () => {
    const req = httpMocks.createRequest({
      query: {
        startDate: "2023-01-01", // Только startDate, endDate отсутствует
      },
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getEventsByDate(req, res);

    // Проверяем, что статус 400
    expect(res.statusCode).toBe(400);

    // Проверяем сообщение об ошибке
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      message: "Both startDate and endDate are required.",
    });
  });

  it("должен вернуть 200 и тренировки", async () => {
    const mockEvent = [
      {
        _id: "1",
        groupTitle: "Title1",
        groupId: "1",
        isCancelled: false,
        date: "2023-01-02",
        participants: [],
      },
    ];

    // Мок успешного ответа
    Event.aggregate.mockResolvedValueOnce(mockEvent);

    const req = httpMocks.createRequest({
      query: {
        startDate: "2023-01-01",
        endDate: "2023-01-04",
      },
    });
    const res = httpMocks.createResponse();

    // Вызов правильного обработчика
    await getEventsByDate(req, res);
    // console.log(res, 'res in getEventsByDate')
    // Проверяем, что статус ответа 200
    expect(res.statusCode).toBe(200);

    // Проверяем, что вернулись правильные данные
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual(mockEvent);
    expect(Event.aggregate).toHaveBeenCalledWith([
      {
        $addFields: {
          dateAsDate: { $toDate: "$date" },
        },
      },
      {
        $match: {
          dateAsDate: {
            $gte: new Date("2023-01-01"),
            $lt: new Date("2023-01-04"),
          },
        },
      },
    ]);
  });
});

////////////////////////////////////////////////////////////////////////

describe("getEventById Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.findById.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getEventById(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Error getting event: Database error",
    });
  });

  it("должен вернуть 200 и тренировку", async () => {
    const mockEvent = {
      _id: "1",
      groupTitle: "Title1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    Event.findById.mockResolvedValueOnce(mockEvent); // Мок успешного ответа

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(res._getJSONData()).toEqual(mockEvent); // Проверяем, что вернулись данные
  });
  it("должен вернуть событие при успешном выполнении запроса", async () => {
    const event = {
      _id: "1",
      groupTitle: "groupTitle 1",
      groupId: "1",
      isCancelled: false,
      date: new Date().toISOString(),
      participants: [],
    };
    await Event.findById.mockResolvedValueOnce(event);

    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(200); // Проверяем, что статус 200
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({ groupTitle: "groupTitle 1" }) // Проверяем, что объект содержит нужное поле
    );
  });

  it("должен вернуть пустой массив, если события нет", async () => {
    const req = httpMocks.createRequest({
      params: { eventId: "1" },
    });
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.statusCode).toBe(404);
    // console.log(res._getData())
    expect(res._getJSONData()).toEqual({ message: "Event not found" });
  });

  it("должен установить правильные заголовки", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await getEventById(req, res);

    expect(res.getHeader("Content-Type")).toBe("application/json");
  });
});

/////////////////////////////////////////////////////////////////////////////

describe("getEventsByGroup Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Event.find.mockRejectedValueOnce(new Error("Database error"));

    const req = httpMocks.createRequest({
      params: {
        groupId: "1",
      },
    });
    const res = httpMocks.createResponse();
    // Вызываем контроллер
    await getEventsByGroup(req, res);

    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Internal Server Error: Database error",
    });
  });

  it("должен вернуть 400, если startDate отсутствует", async () => {
    const req = httpMocks.createRequest({
      params: {},
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await getEventsByGroup(req, res);

    // Проверяем, что статус 400
    expect(res.statusCode).toBe(400);

    // Проверяем сообщение об ошибке
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({ message: "GroupId is required." });
  });

  it("должен вернуть 200 и тренировки", async () => {
    const mockEvent = [
      {
        _id: "1",
        groupTitle: "Title1",
        groupId: "1",
        isCancelled: false,
        date: "2023-01-02",
        participants: [],
      },
    ];

    // Мок успешного ответа
    Event.find.mockResolvedValueOnce(mockEvent);

    const req = httpMocks.createRequest({
      params: {
        groupId: "1",
      },
    });
    const res = httpMocks.createResponse();

    // Вызов правильного обработчика
    await getEventsByGroup(req, res);
    // console.log(res, 'res in getEventsByDate')
    // Проверяем, что статус ответа 200
    expect(res.statusCode).toBe(200);

    // Проверяем, что вернулись правильные данные
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual(mockEvent);
    expect(Event.find).toHaveBeenCalledWith({ group: "1" });
  });
});

///////////////////////////////////////////////////////////////////////////////
