'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-10-19T10:51:36.790Z',
    '2023-10-20T23:36:17.929Z',
    '2023-10-24T17:01:17.194Z',
    '2023-10-27T14:11:59.604Z',
    '2023-10-30T10:17:24.185Z',
    '2023-11-18T21:31:17.178Z',
    '2023-11-23T07:42:02.383Z',
    '2023-11-28T09:15:04.904Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-01T13:15:33.035Z',
    '2023-11-30T09:48:16.867Z',
    '2023-11-25T06:04:23.907Z',
    '2023-11-25T14:18:46.235Z',
    '2023-10-05T16:33:06.386Z',
    '2023-10-10T14:43:26.374Z',
    '2023-10-25T18:49:59.371Z',
    '2023-10-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Function to format date for app
const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const day = `${date.getDay()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

// Function to push HTML elements to webPage
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const moveSort = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  moveSort.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${mov}€</div>
  </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Function to display total balance
const displayCurrentBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov);
  labelBalance.textContent = `${acc.balance}€`;
};

// Function to display summary of data
const displaySummary = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${income}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}€`;
};

// Funciton to create usernames of accounts
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(ele => ele[0])
      .join('');
  });
};
createUsername(accounts);

// Updating UI on change
const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc);

  // Display Balance
  displayCurrentBalance(acc);

  // Display Summary
  displaySummary(acc);
};

const startLogOutTimer = function () {
  // Set timer to 5 mins
  let time = 20;

  const tick = function () {
    const minu = String(Math.trunc(time / 60)).padStart(2, 0);
    const secs = String(Math.trunc(time % 60)).padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${minu}:${secs}`;
    // decrease ls

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Login to get started!';
      containerApp.style.opacity = 0;
    }
    // When 0 seconds left, stop the timer and log out user
    time--;
  };

  tick();
  // Call the timer every second
  const timer = setInterval(tick, 1000);

  return timer;
};

// Adding funciotnality to login button
let currentAccount, timer;

// Loging button
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI & message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Setting up date
    const now = new Date();
    const day = `${now.getDay()}`.padStart(2, 0); // it pads the starting with 0 if string < 2 size.
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const minutes = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;

    // Clear form fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Transfering amount
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Inserting transfer date
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  setTimeout(function () {
    const amount = Number(inputLoanAmount.value);
    if (
      amount > 0 &&
      currentAccount.movements.some(mov => mov >= amount * 0.1)
    ) {
      currentAccount.movementsDates.push(new Date());

      currentAccount.movements.push(amount);
      updateUI(currentAccount);
    }
    inputLoanAmount.value = '';
  }, 3000);
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    inputCloseUsername.value = inputClosePin.value = '';
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
    console.log(accounts);
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currentAccount, sorted);
});
