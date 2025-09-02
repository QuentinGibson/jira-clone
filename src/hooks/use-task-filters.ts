import {
  parseAsString,
  parseAsStringEnum,
  parseAsInteger,
  useQueryStates,
} from "nuqs";

import { TaskStatus } from "types";

export const useTaskFilters = () => {
  return useQueryStates({
    status: parseAsStringEnum(Object.values(TaskStatus)),
    assigneeId: parseAsString,
    search: parseAsString,
    dueDate: parseAsInteger,
  });
};
