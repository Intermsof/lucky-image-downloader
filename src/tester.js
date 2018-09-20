const Client = require('./client');
const Server = require('./server');

const testString = 
`test1.jpg,https://s7d9.scene7.com/is/image/LuckyBrandJeans/7M12573_420_1
test2.jpg,https://s7d9.scene7.com/is/image/LuckyBrandJeans/JLRU8879_710_1
test3.jpg,https://s7d9.scene7.com/is/image/LuckyBrandJeans/7M12085_410_1
test4.jpg,https://s7d9.scene7.com/is/image/LuckyBrandJeans/7M12165_420_1
failure.jpg,https://doesnotexist3412311.com`;

const client = new Client(testString);
const server = new Server(client);