# aws-eni-configutil
Tools for configuring AWS ENIs on Ubuntu. 

## Usage

- Generate a JSON representation of your ENI using the [aws-cli](https://github.com/aws/aws-cli).
  - `aws ec2 describe-network-interfaces --network-interface-ids eni-2492676c > cfg/eni-7290653a.json` or similar
  
- Modify variables in the script. Setting your gateway IP is very important. You can get that with `route -n`.
- Run the script with `node interface-gen.js`. Your config files should now be in the cfg/ directory
- Put ethX.cfg in /etc/network/interfaces.d
- Append `cfg/eth1-rt_tables.cfg` to `/etc/iproute2/rt_tables`
- Run `ifup -a`

## Todo
Write better instructions. PRs welcome.

## License
MIT.
