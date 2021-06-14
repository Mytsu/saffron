import axios from 'axios';

axios.get('https://ranobes.net/novels/534520-cultivation-online-v162128.html', {
    headers: { 'User-Agent': 'Mozilla' }
}).then((response) => { console.log(response ) });