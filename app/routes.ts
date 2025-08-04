import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/signin", "routes/auth/signin.tsx"),
  route("auth/signup", "routes/auth/signup.tsx"),
  route("tournaments", "routes/tournaments/index.tsx"),
  route("tournaments/create", "routes/tournaments/create.tsx"),
  route("tournaments/my", "routes/tournaments/my.tsx"),
  route("tournaments/:id", "routes/tournaments/$id.tsx"),
  route("tournaments/:id/matches", "routes/tournaments/$id/matches.tsx"),
  route("tournaments/manage/:id", "routes/tournaments/manage/$id.tsx"),
  route("tournaments/edit/:id", "routes/tournaments/edit/$id.tsx"),
  route('brackets', 'routes/brackets/index.tsx'),
  route('matches', 'routes/matches/index.tsx'),
] satisfies RouteConfig;
