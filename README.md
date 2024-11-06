
Auto Clear Task Paws Bot

This script automates task completion, claiming rewards, and updating balances for user accounts on the Paws platform.
Register : https://t.me/PAWSOG_bot/PAWS?startapp=r2rGMBc7
Features

- Authenticate and fetch account balance
- Retrieve available quests for each user and complete claimable tasks
- Automatically claim rewards for completed quests
- Randomized delays to mimic human behavior
- Scheduled execution every 24 hours

Requirements

- Node.js (v12+)
- npm or yarn package manager

Setup

1. Clone this repository and navigate to the project folder:
    ```bash
    git clone https://github.com/ganjmsoke/paws.git
    cd auto-clear-task-paws
    ```

2. Install the required dependencies:
    ```bash
    npm install
    ```

3. Prepare `hash.txt` and `user-agent.txt` files in the project root:

    - **hash.txt**: Contains one `query_id` per line (JSON format or plain text).
    - **user-agent.txt**: Contains a list of user-agents to mimic requests from various devices. Add one user-agent per line.

Usage

To run the bot:

```bash
node index.js
```

Execution Overview

- The bot will:
  - Complete and claim quests based on quest status.
  - Log updated balances and maintain a total balance across all users.
  - Execute every 24 hours (automatically scheduled).




Bot created by: t.me/airdropwithmeh
