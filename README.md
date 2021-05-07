


[contributors-shield]: https://img.shields.io/github/contributors/chingu-x/uhurubot.svg?style=for-the-badge
[contributors-url]: https://github.com/chingu-x/uhurubot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/chingu-x/uhurubot.svg?style=for-the-badge
[forks-url]: https://github.com/chingu-x/uhurubot/network/members
[stars-shield]: https://img.shields.io/github/stars/chingu-x/uhurubot.svg?style=for-the-badge
[stars-url]: https://github.com/chingu-x/uhurubot/stargazers
[issues-shield]: https://img.shields.io/github/issues/chingu-x/uhurubot.svg?style=for-the-badge
[issues-url]: https://github.com/chingu-x/uhurubot/issues

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

# uhurubot

Uhuru automates the process of creating Discord channels for Chingu Voyages. It's purpose is
to automate the process to reduce the amount of manual time spent preparing for Voyages,
while improving quality and reducing the chance of errors.

[Process Overview](#process-overview) - [Installation](#installation) - [Usage](#usage) - [Release History](#release-history) - [License](#license)

![Uhurubot Progress Bar](./docs/uhurubot_progress_bar.png)

## Process Overview

Uhurubot does the following to setup the Chingu Discord server with the
channels needed for a particular Voyage:

1. Create a category for the voyage
2. Create the `#team-advice` channel in the voyage category. Ensure that
`@everyone` may view it, but are restricted from posting messages.
3. Create the `#team-resources` channel in the voyage category. Ensure that
`@everyone` may view it, but are restricted from posting messages.
4. Create a chat & a voice channel for each team in the voyage category
5. Post the call to action message for the Voyage kickoff into the channel.
6. From a user supplied list of Discord account names for members of each 
team, add team members to the channels
7. Post daily advice to the `#team-advice` channel based on a schedule 
defined by Chingu administrators. Advice will be maintained in another data
source and must allow certain names and dates to be customized based on the
Voyage schedule.

These functions are not executed at the same point in time:

- Items 1-5 above may be requested anytime prior to the start of the voyage.
- Item 6 may be requested at anytime
- Item 7 will be run based on a predefined schedule using an external scheduler

## Installation

To install this app:
```
git clone https://github.com/chingu-x/uhurubot.git
npm i
```

To run the app check out the information in the *_'Usage'_* section below.

Uhurubot must be defined in the Discord server and granted administrator
permissions. 
## Usage

Uhurubot is a command line application (CLI). The basic command to run it is:
```
node uhuru <option> <flags>
```
| Option     | Description                                 | Permissable flags |
|------------|---------------------------------------------|-------------------|
| create     | Create channels for a Voyage                | v                 |
| authorize  | Authorize users to access channels          | v                 |
| post       | Post a message in the `#team-advice` channel | p                |

Before running it you'll first need to identify option values you'll using 
in both the command line and the CLI `.env` file. 

| CLI Flag        | `.env` Parm    | Description                              |
|-----------------|----------------|------------------------------------------|
| -v, --voyage    | VOYAGE         | Voyage teams & users (JSON file) |
| -p, --posts     | POSTS          | Channel post specifications (JSON file) |
 
It's important to keep in mind that options you supply on the command line
ALWAYS override the same option you specify in the `.env` file.

`env.sample` in the root of the project contains a sample of how to set up a `.env` file.

### Configuration files

Due to the complexity of the data required to setup channels, authorize users,
and manage channel posts command line parameters are not a good solution for
specifying the parameters needed to guide these operations.

Instead, CLI parameters defining JSON files containing the necessary
specifications are used. The following sections define the format and content
of these files.
#### Voyage Teams & Users

The following shows the format of the Voyage Teams & Users JSON file:

```
{
  "voyages": "nn", 
  "teams": [
    {
      "team": "<animalname-nn>",
      "discord_names": ["user1", "user2", "user3"]
    }, {
      "team": "<animalname-nn>",
      "discord_names": ["user4", "user5", "user6"]
    }, {
      "team": "<animalname-nn>",
      "discord_names": ["user4", "user5", "user6"]
    },
  ]
}
```

`<animalname-nn>` should be replaced with a unique team name. For example,
`toucans-01`. Any valid string value may be used for an animal name, but
the current practice is to use:

- Tier 1 teams: `toucans`
- Tier 2 teams: `geckos`
- Tier 3 teams: `bears`

#### Post Specifications



### CLI Examples

#### Example #1

## Release History

You can find what changed, when in the [release history](./docs/RELEASE_HISTORY.md)

## License

Copyright 2021 &copy; Chingu, Inc.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
