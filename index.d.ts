declare namespace kdljs {
  /**
   * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#document|Document}.
   */
  export type Document = Node[];

  /**
   * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#node|Node}.
   */
  export interface Node {
    /** The name of the Node */
    name: string;
    /** Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#argument|Arguments} */
    values: Value[];
    /** Collection of {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#property|Properties} */
    properties: Record<string, Value>;
    /** Nodes in the {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#children-block|Children block} */
    children: Document;
  }

  /**
   * A {@link https://github.com/kdl-org/kdl/blob/main/SPEC.md#value|Value}.
   */
  export type Value = string | number | boolean | null;

  export interface ParseResult {
    /** Parsing errors */
    errors: chevrotain.IRecognitionException[];
    /** KDL Document */
    output?: Document;
  }
}

/**
  * @param {string} text - Input KDL file (or fragment)
  */
declare function parse(text: string): kdljs.ParseResult;

export = parse;
