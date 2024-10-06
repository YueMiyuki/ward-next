This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

---
### Ward Dashboard

> [![ward](https://github-readme-stats.vercel.app/api/pin/?username=YueMiyuki&repo=ward-next&show_icons=true&bg_color=23272A&title_color=FF73F1&text_color=FFC0CB&icon_color=9B84EE&count_private=true&border_color=fAA61A&border_radius=10)](https://github.com/YueMiyuki/ward-next)  
> ![CodeFactor](https://img.shields.io/codefactor/grade/github/YueMiyuki/ward-next?style=for-the-badge&logo=codefactor) ![commit](https://img.shields.io/github/last-commit/YueMiyuki/ward-next?color=%23181717&logo=GitHub&style=for-the-badge)  
> [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D4AMI3T)   
> [Original work](https://github.com/B-Software/Ward)  

This project is a modern build of [Ward Dashboard](https://github.com/B-Software/Ward) built with NextJS.

---
## Getting Started

First, ensure you have dependencies for node-systeminformation installed. For example, `lm-sensors` and `dmidecode` are required to get the temperature and memory info. Also ensure you have `git` installed to clone this repo

On Ubuntu, run these commmands
```
sudo apt-get update
sudo apt-get install lm-sensors dmidecode git
```

Next, we need NodeJS v20+ to run this project, on Ubuntu:
```
# This is from the NodeJS official documentation
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.18.0`
```

As we use `pnpm` for our package manager, we need to install it by running
```
sudo npm install -g pnpm
```

Now clone the repo and change directory
```
git clone https://github.com/YueMiyuki/ward-next
cd ward-next
```

Install Node dependencies
```
pnpm install
```

Build the project
```
pnpm build
```

Now you're all set! Start the WebUI by
```
pnpm start -p <PORT>
```
Example:
```
pnpm start -p 3000
```

## Feature request and Issues
Please open an issue on GitHub for any feature request and issue

---
Made with ❤️ by MiyukiYue
