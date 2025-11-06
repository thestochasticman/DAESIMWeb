This is the web interface for the [DAESIMWeb](https://github.com/NortonAlex/DAESIM) python package.



## Deployment

Prior to running this, start the the caddy container in [borevitz_projects_caddy](https://github.com/thestochasticman/borevitz_projects_caddy)

make sure the the network 'edge' has been created. 

```
sudo docker network ls --filter name=^edge$ --format '{{.Name}}'
[sudo] password for yasar: 
edge
```
If not created(You dont get 'edge' as an output)
```
sudo docker network create edge
```
Then build the containers

```
sudo docker compose build frontend
sudo docker compose build frontend
```

Start the containers
```
sudo docker compose up backend

sudo docker compose up frontend
```

View the website on http://130.56.246.157/DAESIM






## Shutting Down

```
sudo docker compose down backend

sudo docker compose down frontend 
```