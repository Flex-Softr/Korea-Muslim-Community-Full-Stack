declare module "@svg-maps/world" {
  type SvgMapLocation = {
    id: string;
    name: string;
    path: string;
  };

  type SvgMap = {
    label: string;
    viewBox: string;
    locations: SvgMapLocation[];
  };

  const world: SvgMap;
  export default world;
}
