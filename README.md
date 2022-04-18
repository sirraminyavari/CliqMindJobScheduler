# CliqMindJobScheduler

## Docker run command
docker run -e WEBAPP_BASEURL=http[s]://[HOST] -e WEBAPP_USERNAME=[USERNAME] -e WEBAPP_PASSWORD=[PASSWORD] raminyavari/cliqmind-scheduler

## Create from Scratch
1. Create Docker image, build `Dockerfile`
2. Build the image, `docker build -t scheduler .`
3. Define services, port bindings, in `docker-compose.yml`
4. Build and run w/ compose, `docker-compose up` (add `-d` for it to run 'detatched', in background)

## Clone and Run

 `docker-compose up` (first time run will perform build)
    - you can force a fresh build with `--build`
    - you can background (run without holding up your CLI) by using `--detach`