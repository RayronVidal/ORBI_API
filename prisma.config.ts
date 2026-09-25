import { defineConfig, env} from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: "mysql://root:@localhost:3306/orbi",
  },
});