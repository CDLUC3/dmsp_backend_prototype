import { Resolvers } from "../types";
import { MyContext } from "../context";
import { Tag } from "../models/Tag";


// Mock tag data
const tag1 = new Tag({
    id: 1,
    name: "Tag 1",
    description: "Description for Tag 1",
    createdById: 1,
    modifiedById: 1,
    created: new Date(),
    modified: new Date(),
});

const tag2 = new Tag({
    id: 2,
    name: "Tag 2",
    description: "Description for Tag 2",
    createdById: 1,
    modifiedById: 1,
    created: new Date(),
    modified: new Date(),
});
export const resolvers: Resolvers = {
    Query: {
        // Get the Sections that belong to the current template id
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tags: async (_, __, _context: MyContext): Promise<Tag[]> => {
            return [tag1, tag2]
        },
    }
}
