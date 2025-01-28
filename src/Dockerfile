FROM node:20.14.0-alpine
WORKDIR /work

COPY ./ /work
RUN npm i
RUN npm install -g pnpm
RUN npm install -g vite-node
RUN pnpm build

COPY ./entrypoint.sh /usr/local/bin/
ENTRYPOINT ["sh", "entrypoint.sh"]

CMD [ "node" ]