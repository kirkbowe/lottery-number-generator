# Lottery Number Generator

This project is a web application that generates random numbers for the UK National Lottery and (optionally) checks them against recent draws. The random number generator uses the Web Cryptography API to generate numbers in as non-deterministic a way as possible.

See the example: https://www.kirkbowe.com/lotto.html

## Features

- Generate a set of random numbers for the UK National Lottery
- Customize the number of balls and the highest number
- Option to fetch and display recent matches from the last 180 days
- Share the generated numbers as an image on social media
- Responsive design for various screen sizes

## Technologies Used

- HTML
- CSS
- JavaScript
- Bootstrap (CSS framework)
- html2canvas (JavaScript library for rendering HTML content as canvas)

## Getting Started

To run the project locally, simply open the `lotto.html` file in a web browser.

Alternatively, you can host the project on a web server and access it through a URL.

## Usage

1. Open the `lotto.html` file in a web browser.
2. Optionally, adjust the "Number of Balls" and "Highest Number" fields to customize the lottery number generation.
3. Check the "Fetch recent matches?" checkbox if you want to display recent matches from the last 180 days.
4. Click the "Generate" button to generate the random lottery numbers.
5. If the "Fetch recent matches?" option was selected, the best matches from the last 180 days will be displayed in a table.
6. To share the generated numbers as an image, click the "Share Image" button.
7. On narrow screens, the generated numbers will be scaled down to fit the viewport, and the circular backgrounds will maintain their proportions.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

Copyright 2024 Kirk Bowe.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License

## Disclaimer

This project is for educational purposes only and is not affiliated with the official UK National Lottery.
