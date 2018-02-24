# DACP Todo List

The following list consists of the large contributions that need to be done to make the program
fully functional. As there is still much work to be done to make the library useful, help is greatly
appreciated.

## List

* Add a general information section to the dataset. This could include information about all of the
data. For instance, categories like all coins and the total balance of the coin, total balance of
portfolio, array of all exchanges, array of all coins, etc.

* The code needs to be made more efficient. Since there are delays because of the rate limits of the
exchanges, it takes time to create the dataset. A more efficient method to work with the rate limits
needs to be implemented.

* The dataset should be saved to a file by the end of the process. Instead of restarting each time,
a user can load the information from the file. To keep the information current, there should be
options to update the data. For instance, a command to update the balance of coins in a particular
exchange and a command to update the price in USD of of all coins.

* An input should be made to include the holdings of coins in cold wallets as well to be able to
calculate the value of an investors complete portfolio.


More will soon come. If there are any questions on the details provided above, please contact me at
danieljpye12@gmail.com.
