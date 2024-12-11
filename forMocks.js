const groups = [
    {
      _id: "1",
      title: "Group 1",
      coachId: "coach1",
      payment: [],
      schedule: [],
      participants: [],
    },
    {
      _id: "2",
      title: "Group 2",
      coachId: "coach2",
      payment: [],
      schedule: [],
      participants: [],
    },
  ];
  //: EventTypeDB[]
   const events= [    
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

    const users= [ //: User[] 
        {
          _id: "1",
          name: "userName 1",
          password: "111",
          phone: "11111",
          isAdmin: false,
          groups: [],
          balance: 11,
          telegramId: 111,
          discount: 11,
          visits: [],
        },
        {
          _id: "2",
          name: "userName 2",
          password: "222",
          phone: "22222",
          isAdmin: true,
          groups: [],
          balance: 22,
          telegramId: 222,
          discount: 22,
          visits: [],
        },
      ];