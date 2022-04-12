/** @format */

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function seed() {
  const customer = await createCustomer()
  const movies = await createMovies()
  const screens = await createScreens()
  const screenings = await createScreenings(screens, movies)

  process.exit(0)
}

async function createCustomer() {
  const customer = await prisma.customer.create({
    data: {
      name: "Alice",
      contact: {
        create: {
          email: "alice@boolean.co.uk",
          phone: "1234567890",
        },
      },
    },
    include: {
      contact: true,
    },
  })

  console.log("Customer created", customer)

  return customer
}

async function createMovies() {
  const rawMovies = [
    { title: "The Matrix", runtimeMins: 120 },
    { title: "Dodgeball", runtimeMins: 154 },
  ]

  const movies = []

  for (const rawMovie of rawMovies) {
    const movie = await prisma.movie.create({ data: rawMovie })
    movies.push(movie)
  }

  console.log("Movies created", movies)

  return movies
}

async function createScreens() {
  const rawScreens = [
    {
      number: 1,
      seats: {
        create: [
          { row: "A", number: 1 },
          { row: "A", number: 1 },
          { row: "A", number: 1 },
        ],
      },
    },
    {
      number: 2,
      seats: {
        create: [
          { row: "A", number: 1 },
          { row: "A", number: 1 },
          { row: "A", number: 1 },
          { row: "A", number: 1 },
        ],
      },
    },
  ]

  const screens = []

  for (const rawScreen of rawScreens) {
    const screen = await prisma.screen.create({
      data: rawScreen,
    })

    console.log("Screen created", screen)

    screens.push(screen)
  }

  return screens
}

async function createScreenings(screens, movies) {
  const screeningDate = new Date()

  for (const screen of screens) {
    for (let i = 0; i < movies.length; i++) {
      screeningDate.setDate(screeningDate.getDate() + i)

      const screening = await prisma.screening.create({
        data: {
          startsAt: screeningDate,
          movie: {
            connect: {
              id: movies[i].id,
            },
          },
          screen: {
            connect: {
              id: screen.id,
            },
          },
        },
        include: {
          screen: {
            include: {
              seats: true
            }
          }
        }
      })
      // screenings.push(screening)
      console.log("Screening created", screening)
    }
  }
}

async function createTickets(customer, screening, numberSeats) {
  const seatsToBook = []
  for(let i=0; i<numberSeats.length; i++) {
    seatsToBook.push({
      id: screening.screen.seats[i].id
    })
  }

  const createTicket = await prisma.ticket.create({
    data: {
      customer: {
        connect: {
          id: customer.id
        }
      },
      screening: {
        connect: {
          id: screening.id
        }
      },
      seats: {
        connect: seatsToBook
      }
    }
  })
}


seed()
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
  .finally(() => process.exit(1))
