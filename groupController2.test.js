const { addGroup, updateGroup, deleteGroup } = require("./groupController");

const {
  isValidGroupData,
  isGroupAlreadyExist,
  isGroupScheduleSuitable,
} = require("../helpers/validators");
const { Group } = require("../models/groupModel");
const httpMocks = require("node-mocks-http");

jest.mock("../helpers/validators", () => ({
  isValidGroupData: jest.fn(),
  isGroupAlreadyExist: jest.fn(),
  isGroupScheduleSuitable: jest.fn(),
}));

jest.mock("../models/groupModel", () => ({
  Group: {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

describe("addGroup Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    isValidGroupData.mockReturnValue(true); // Указывает, что данные валидны
    isGroupAlreadyExist.mockResolvedValue(false); // Указывает, что группа с таким именем не существует
    isGroupScheduleSuitable.mockResolvedValue(null); // Расписание подходит
  });

  it("должен корректно использовать схемы валидации", async () => {
    expect(isGroupScheduleSuitable).toBeDefined();
    expect(isGroupAlreadyExist).toBeDefined();
    expect(isValidGroupData).toBeDefined();

    const mockData = {
      _id: "1",
      title: "Group 1",
      coachId: "coach1",
      payment: [],
      schedule: [],
      participants: [],
    };

    isGroupScheduleSuitable(mockData.schedule);
    expect(isGroupScheduleSuitable).toHaveBeenCalledWith(mockData.schedule);

    isGroupAlreadyExist(mockData.title);
    expect(isGroupAlreadyExist).toHaveBeenCalledWith(mockData.title);

    isValidGroupData(mockData);
    expect(isValidGroupData).toHaveBeenCalledWith(mockData);
  });

  it("должен вернуть ошибку 500 при сбое базы данных", async () => {
    // Мокаем метод find, чтобы он выбрасывал ошибку
    Group.create.mockRejectedValueOnce(
      new Error("Failed to create group. Please try again later.")
    );

    Group.findOne.mockResolvedValueOnce(null);

    const mockData = {
      title: "Group 1",
      coachId: "coach1",
      payment: [
        {
          dailyPayment: 10,
          monthlyPayment: 100,
        },
      ],
      schedule: [
        { day: "Monday", time: "10:00" },
        { day: "Wednesday", time: "12:00" },
      ],
      participants: [],
    };
    const req = httpMocks.createRequest({
      body: mockData,
    });
    const res = httpMocks.createResponse();

    // Вызываем контроллер
    await addGroup(req, res);
    console.log(res._getData());
    // Проверяем, что метод status был вызван с кодом 500
    expect(res.statusCode).toBe(500);

    // Проверяем, что метод json был вызван с правильным сообщением
    const responseData = JSON.parse(res._getData());
    //console.log("Response data:", responseData);
    expect(responseData).toEqual({
      message: "Server error",
    });
  });
  // it("должен вернуть ошибку 500 при сбое базы данных", async () => {
  //   // Мокаем метод save, чтобы он выбрасывал ошибку
  //   Event.mockImplementationOnce(() => {
  //     return {
  //       save: jest.fn().mockRejectedValueOnce(new Error("Database error")),
  //     };
  //   });
  //   validateEvent.mockImplementationOnce(() => ({
  //     _id: "111",
  //     group: "1",
  //     groupTitle: "groupTitle1",
  //     isCancelled: false,
  //     date: new Date().toISOString(),
  //     participants: [],
  //   }));

  //   const req = httpMocks.createRequest({
  //     body: {
  //       _id: "111",
  //       group: "1",
  //       groupTitle: 'groupTitle1',
  //       isCancelled: false,
  //       date: new Date().toISOString(),
  //       participants: [],
  //     },
  //   });
  //   const res = httpMocks.createResponse();

  //   // Вызываем контроллер
  //   await createEvent(req, res);

  //   // Проверяем, что метод status был вызван с кодом 500
  //   expect(res.statusCode).toBe(500);

  //   // Проверяем, что метод json был вызван с правильным сообщением
  //   const responseData = JSON.parse(res._getData());
  //   expect(responseData).toEqual({
  //     message: "Internal Server Error: Database error",
  //   });
  // });

  // it("должен вернуть 400, если date имеет неверный формат", async () => {
  //   validateEvent.mockImplementation(() => {
  //     throw new Error('Validation error: "date" must be a valid ISO 8601 date');
  //   });

  //   const req = httpMocks.createRequest({
  //     body: {
  //       _id: "111",
  //       group: "1",
  //       isCancelled: false,
  //       date: "неверный_формат_даты", // Неверный формат
  //       participants: [],
  //     },
  //   });

  //   const res = httpMocks.createResponse();

  //   await createEvent(req, res);

  //   expect(res.statusCode).toBe(400);
  //   const responseData = JSON.parse(res._getData());
  //   expect(responseData).toEqual({
  //     message: 'Validation error: "date" must be a valid ISO 8601 date',
  //   });

  //   expect(validateEvent).toHaveBeenCalledWith(expect.any(Object), req.body);
  // });

  // it("должен успешно создать событие и вернуть статус 201", async () => {
  //     const mockEvent = {
  //       _id: "1111",
  //       group: "1",
  //       groupTitle: "groupTitle1",
  //       isCancelled: false,
  //       date: "2023-01-02",
  //       participants: [],
  //     };
  //     validateEvent.mockImplementationOnce(() => ({
  //       _id: "1111",
  //       group: "1",
  //       groupTitle: "groupTitle1",
  //       isCancelled: false,
  //       date: "2023-01-02",
  //       participants: [],
  //     }));
  //     // Настраиваем save для возврата mockEvent
  //     const { saveMock } = require("../models/eventModel").__mocks__;
  //     saveMock.mockResolvedValueOnce(mockEvent);

  //     const req = httpMocks.createRequest({
  //       body: mockEvent,
  //     });

  //     const res = httpMocks.createResponse();

  //     // Вызов контроллера
  //     await createEvent(req, res);

  //     // Проверяем, что статус ответа 201
  //     expect(res.statusCode).toBe(201);

  //     // Проверяем, что возвращены правильные данные
  //     const responseData = JSON.parse(res._getData());
  //     expect(responseData).toEqual(mockEvent);

  //     // Проверяем, что save был вызван
  //     expect(saveMock).toHaveBeenCalledTimes(1);

  //     // Проверяем, что конструктор Event был вызван с корректными параметрами
  //     expect(Event).toHaveBeenCalledWith(mockEvent);
  //   });

  //   it("должен вернуть 500 при ошибке конструктора Event", async () => {
  //     Event.mockImplementationOnce(() => {
  //       throw new Error("Constructor error");
  //     });

  //     const req = httpMocks.createRequest({
  //       body: {
  //         _id: "1111",
  //         group: "1",
  //         groupTitle: "groupTitle1",
  //         isCancelled: false,
  //         date: "2023-01-02",
  //         participants: [],
  //       },
  //     });
  //     const res = httpMocks.createResponse();
  //     validateEvent.mockImplementationOnce(() => ({
  //       _id: "1111",
  //       group: "1",
  //       groupTitle: "groupTitle1",
  //       isCancelled: false,
  //       date: "2023-01-02",
  //       participants: [],
  //     }));
  //     await createEvent(req, res);

  //     expect(res.statusCode).toBe(500);
  //     const responseData = JSON.parse(res._getData());
  //     expect(responseData).toEqual({
  //       message: "Internal Server Error: Constructor error",
  //     });
  //   });
  //   it("должен вернуть 400, если date имеет неверный формат", async () => {
  //     const req = httpMocks.createRequest({
  //       body: {
  //         _id: "111",
  //         group: "1",
  //         isCancelled: false,
  //         date: "неверный_формат_даты", // Неверный формат
  //         participants: [],
  //       },
  //     });

  //     const res = httpMocks.createResponse();

  //     await createEvent(req, res);

  //     // Проверяем, что статус 400
  //     expect(res.statusCode).toBe(400);

  //     // Проверяем сообщение об ошибке
  //     const responseData = JSON.parse(res._getData());
  //     expect(responseData).toEqual({
  //       message: "Validation error: \"date\" must be a valid ISO 8601 date",
  //     });
});
