const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    const customer = await createCustomer();
    const movies = await createMovies();
    const screens = await createScreens();
    const screenings = await createScreenings(screens, movies);

    //Create a ticket for the first screening, booking 2 seats
    await createTicket(customer, screenings[0], 2)

    //Create a ticket for the second screening, booking 3 seats
    await createTicket(customer, screenings[1], 3)

    process.exit(0);
}

async function createTicket(customer, screening, numberSeats) {
  console.log("Creating ticket for customer:", customer)
  console.log("Creating ticket for screening:", screening)
  console.log("Creating ticket for seats:", screening.screen.seats)
  console.log("Creating ticket with number of seats:", numberSeats)


  //To connect multiple seat records to our ticket we need to 
  //provide prisma with an array that looks like this:
  //
  // [
  //  { id: 1 },
  //  { id: 2 }
  //  etc...
  // ]
  //
  //Where id is the seatId. Create this array using a for loop. 
  //Based on the number of seats passed in to the function take 
  //that many seats from the list of seats on the screen and add
  //them to the seatsToBook array.
  const seatsToBook = []
  for(let i=0;i<numberSeats;i++) {
    seatsToBook.push({
      id: screening.screen.seats[i].id
    })
  }
 
  //IMPORTANT NOTE! Since we need to link the seats using 
  //connect, we can't specify customerId directly, we also
  //need to use connect to link the customer. If you use connect
  //for one relation in Prisma, then you need to use it for
  //all of them
  const createdTicket = await prisma.ticket.create({
    data: {
      //Link the customer
      customer : {
        connect: {
          id: customer.id
        }
      },
      //Link the screening
      screening : {
        connect: {
          id: screening.id
        }
      },
      //Link the list of seats we created earlier
      seats : {
        connect : seatsToBook
      }
    },
    //Ask prisma to return the related data so we can 
    //see it on our console.log
    include : {
      customer: true,
      screening: {
        include : {
          movie: true
        }
      },
      seats: true
    }
  })

  console.log("Created ticket:", createdTicket)
}

async function createCustomer() {
    const customer = await prisma.customer.create({
        data: {
            name: 'Alice',
            contact: {
                create: {
                    email: 'alice@boolean.co.uk',
                    phone: '1234567890'
                }
            }
        },
        include: {
            contact: true
        }
    });

    console.log('Customer created', customer);

    return customer;
}

async function createMovies() {
    const rawMovies = [
        { title: 'The Matrix', runtimeMins: 120 },
        { title: 'Dodgeball', runtimeMins: 154 },
    ];

    const movies = [];

    for (const rawMovie of rawMovies) {
        const movie = await prisma.movie.create({ data: rawMovie });
        movies.push(movie);
    }

    console.log('Movies created', movies);

    return movies;
}

async function createScreens() {
    //One screen has many seats - When we create our screens, create some linked seat records. 
    //Use Prisma's nested write syntax to do this. This is a good use of nested writes, as 
    //screens would be unlikely to exist without seats.
    const rawScreens = [
        {
          number: 1,
          seats : {
            create: [
              //Specify the seat records we want to create and link to this screen
              { row: 'A', number :1 },
              { row: 'A', number :2 },
              { row: 'A', number :3 }
            ]
          }
        }, 
        { 
          number: 2,
          seats : {
            create: [
              //Specify the seat records we want to create and link to this screen
              { row: 'A', number :1 },
              { row: 'A', number :2 },
              { row: 'B', number :1 },
              { row: 'B', number :2 }
            ]
          }
        }
    ];

    const screens = [];

    for (const rawScreen of rawScreens) {
        const screen = await prisma.screen.create({
            data: rawScreen,
            //Tell prisma to include the seats in the returned record
            include: {
              seats: true
            }
        });

        console.log('Screen created', screen);

        screens.push(screen);
    }

    return screens;
}

async function createScreenings(screens, movies) {
    const screenings = []

    const screeningDate = new Date();

    for (const screen of screens) {
        for (let i = 0; i < movies.length; i++) {
            screeningDate.setDate(screeningDate.getDate() + i);

            const screening = await prisma.screening.create({
                data: {
                    startsAt: screeningDate,
                    movie: {
                        connect: {
                            id: movies[i].id
                        }
                    },
                    screen: {
                        connect: {
                            id: screen.id
                        }
                    }
                },
                //Tell Prisma we want to include the related 
                //screen in the return data
                include:{ 
                  screen: {
                    //Also Include the seats for the screen
                    //in the return data
                    include: {
                      seats: true
                    }
                  }
                }
            });

            //Add the screening we have created to the array of screenigs
            screenings.push(screening)

            console.log('Screening created', screening);
        }
    }

    //return the array of screenings
    return screenings
}

seed()
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
    })
    .finally(() => process.exit(1));