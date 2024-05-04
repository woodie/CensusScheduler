import { RowDataPacket } from "mysql2";
import { NextApiRequest, NextApiResponse } from "next";

import { pool } from "lib/database";
import type { IResShiftCategoryItem } from "src/components/types";

const shiftCategories = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    // patch
    // --------------------
    case "PATCH": {
      // update shift category
      const { category, id, name }: IResShiftCategoryItem = JSON.parse(
        req.body
      );

      await pool.query<RowDataPacket[]>(
        `UPDATE op_shift_category
        SET
          category=?,
          shift_category=?,
          update_category=true
        WHERE shift_category_id=?`,
        [category, name, id]
      );

      return res.status(200).json({
        statusCode: 200,
        message: "OK",
      });
    }

    // default
    // --------------------
    default: {
      // send error message
      return res.status(404).json({
        statusCode: 404,
        message: "Not found",
      });
    }
  }
};

export default shiftCategories;
