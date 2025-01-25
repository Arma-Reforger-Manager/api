FROM node:20.14.0-alpine
WORKDIR /work

COPY ./ /work
RUN npm i
RUN npm install -g pnpm
RUN pnpm build

COPY ./docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["sh", "docker-entrypoint.sh"]

CMD [ "node" ]