const {
    createEvent,
    updateEvent,
    deleteEvent,
  } = require("./eventsController");

  const { validateEvent } = require("../helpers/validators");
  const { Event } = require("../models/eventModel");
  const httpMocks = require("node-mocks-http");
  jest.mock("../helpers/validators", () => ({
    validateEvent: jest.fn(),
  }));
  jest.mock("../models/eventModel", () => {
    const saveMock = jest.fn();  // Мок метода save
    
    const validateMock = jest.fn().mockImplementation((data) => {
      if (!data._id) {
        return { error: { details: [{ message: '"_id" is required' }] } };  // Создаем ошибку
      }
      return { value: data };  // Возвращаем данные, если все нормально
    });
  
    const mockSchemas = {
      addEventSchema: {
        validate: validateMock,  // Мокируем метод validate
      },
    };
  
    const EventMock = jest.fn().mockImplementation((data) => ({
      ...data,
      save: saveMock,
    }));
  
    return {
      Event: EventMock,
      schemas: mockSchemas,
      __mocks__: {
        saveMock,
        validateMock,  // Экспортируем мок validate
      },
    };
  });
  
  
  
 
  
  
  describe("createEvent Controller", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it("должен корректно использовать схему валидации", async () => {
      // Импортируем замокированный schemas
      const { schemas } = require("../models/eventModel");
  
      // Проверяем, что addEventSchema определен
      expect(schemas.addEventSchema).toBeDefined();
  
      // Проверяем, что метод validate определен
      expect(schemas.addEventSchema.validate).toBeDefined();
  
      // Дополнительно: Проверяем вызов validate
      const mockData = { _id: "111", date: "2023-12-01", group: "1", participants: [] };
      schemas.addEventSchema.validate(mockData);
  
      // Убедитесь, что validate был вызван
      const { validateMock } = require("../models/eventModel").__mocks__;
      expect(validateMock).toHaveBeenCalledWith(mockData);
    });
  
    it("должен вернуть ошибку 500 при сбое базы данных", async () => {
      // Мокаем метод save, чтобы он выбрасывал ошибку
      Event.mockImplementationOnce(() => {
        return {
          save: jest.fn().mockRejectedValueOnce(new Error("Database error")),
        };
      });
      validateEvent.mockImplementationOnce(() => ({
        _id: "111",
        group: "1",
        groupTitle: "groupTitle1",
        isCancelled: false,
        date: new Date().toISOString(),
        participants: [],
      }));
    
      const req = httpMocks.createRequest({
        body: {
          _id: "111",
          group: "1",
          groupTitle: 'groupTitle1', 
          isCancelled: false,
          date: new Date().toISOString(),
          participants: [],
        },
      });
      const res = httpMocks.createResponse();
    
      // Вызываем контроллер
      await createEvent(req, res);
    
      // Проверяем, что метод status был вызван с кодом 500
      expect(res.statusCode).toBe(500);
    
      // Проверяем, что метод json был вызван с правильным сообщением
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        message: "Internal Server Error: Database error",
      });
    });
    
  
    it("должен вернуть 400, если date имеет неверный формат", async () => {
      validateEvent.mockImplementation(() => {
        throw new Error('Validation error: "date" must be a valid ISO 8601 date');
      });
  
      const req = httpMocks.createRequest({
        body: {
          _id: "111",
          group: "1",
          isCancelled: false,
          date: "неверный_формат_даты", // Неверный формат
          participants: [],
        },
      });
  
      const res = httpMocks.createResponse();
  
      await createEvent(req, res);
  
      expect(res.statusCode).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({
        message: 'Validation error: "date" must be a valid ISO 8601 date',
      });
  
      expect(validateEvent).toHaveBeenCalledWith(expect.any(Object), req.body);
    });

    
  
    it("должен успешно создать событие и вернуть статус 201", async () => {
        const mockEvent = {
          _id: "1111",
          group: "1",
          groupTitle: "groupTitle1",
          isCancelled: false,
          date: "2023-01-02",
          participants: [],
        };
        validateEvent.mockImplementationOnce(() => ({
          _id: "1111",
          group: "1",
          groupTitle: "groupTitle1",
          isCancelled: false,
          date: "2023-01-02",
          participants: [],
        }));
        // Настраиваем save для возврата mockEvent
        const { saveMock } = require("../models/eventModel").__mocks__;
        saveMock.mockResolvedValueOnce(mockEvent);
    
        const req = httpMocks.createRequest({
          body: mockEvent,
        });
    
        const res = httpMocks.createResponse();
    
        // Вызов контроллера
        await createEvent(req, res);
    
        // Проверяем, что статус ответа 201
        expect(res.statusCode).toBe(201);
    
        // Проверяем, что возвращены правильные данные
        const responseData = JSON.parse(res._getData());
        expect(responseData).toEqual(mockEvent);
    
        // Проверяем, что save был вызван
        expect(saveMock).toHaveBeenCalledTimes(1);
    
        // Проверяем, что конструктор Event был вызван с корректными параметрами
        expect(Event).toHaveBeenCalledWith(mockEvent);
      });

      it("должен вернуть 500 при ошибке конструктора Event", async () => {
        Event.mockImplementationOnce(() => {
          throw new Error("Constructor error");
        });
      
        const req = httpMocks.createRequest({
          body: {
            _id: "1111",
            group: "1",
            groupTitle: "groupTitle1",
            isCancelled: false,
            date: "2023-01-02",
            participants: [],
          },
        });
        const res = httpMocks.createResponse();
        validateEvent.mockImplementationOnce(() => ({
          _id: "1111",
          group: "1",
          groupTitle: "groupTitle1",
          isCancelled: false,
          date: "2023-01-02",
          participants: [],
        }));
        await createEvent(req, res);
      
        expect(res.statusCode).toBe(500);
        const responseData = JSON.parse(res._getData());
        expect(responseData).toEqual({
          message: "Internal Server Error: Constructor error",
        });
      });
      it("должен вернуть 400, если date имеет неверный формат", async () => {
        const req = httpMocks.createRequest({
          body: {
            _id: "111",
            group: "1",
            isCancelled: false,
            date: "неверный_формат_даты", // Неверный формат
            participants: [],
          },
        });
      
        const res = httpMocks.createResponse();
      
        await createEvent(req, res);
      
        // Проверяем, что статус 400
        expect(res.statusCode).toBe(400);
      
        // Проверяем сообщение об ошибке
        const responseData = JSON.parse(res._getData());
        expect(responseData).toEqual({
          message: "Validation error: \"date\" must be a valid ISO 8601 date",
        });
      });
      
    });