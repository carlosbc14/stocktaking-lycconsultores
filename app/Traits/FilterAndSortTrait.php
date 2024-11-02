<?php

namespace App\Traits;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

trait FilterAndSortTrait
{
    public function applyFilters(Request $request, $query)
    {
        $filterBy = $request->input('filterBy');
        $filterValue = $request->input('filterValue');

        if ($filterBy && $filterValue) {
            $filterParts = explode('.', $filterBy);
            $column = array_pop($filterParts);
            $relationPath = implode('.', $filterParts);

            if ($relationPath) {
                $query->whereHas($relationPath, function ($query) use ($column, $filterValue) {
                    $query->where($column, 'like', "%$filterValue%");
                });
            } else {
                $query->where($column, 'like', "%$filterValue%");
            }
        }

        return $query;
    }

    public function applySorting(Request $request, $query)
    {
        $sortBy = $request->input('sortBy', 'created_at');
        $sortDirection = $request->input('sortDirection', 'desc');

        if ($sortBy) {
            $sortParts = explode('.', $sortBy);
            $column = array_pop($sortParts);
            $relations = $sortParts;

            $baseModel = $query->getModel();
            $baseTable = $baseModel->getTable();

            if (!empty($relations)) {
                $lastRelationModel = $baseModel;
                $lastRelationTable = $baseTable;
                $joinCount = 0;

                foreach ($relations as $relation) {
                    $relationModel = $lastRelationModel->$relation()->getModel();
                    $relationTable = $relationModel->getTable();
                    $alias = ($relationTable === $lastRelationTable) ? "{$relationTable}_" . (++$joinCount) : $relationTable;
                    $relationForeignKey = "$alias.id";
                    $localForeignKey = "$lastRelationTable." . Str::singular($relationTable) . "_id";

                    $query->leftJoin("$relationTable as $alias", $relationForeignKey, '=', $localForeignKey);
                    $lastRelationModel = $relationModel;
                    $lastRelationTable = $alias;
                }

                $query->orderBy("$lastRelationTable.$column", $sortDirection)->select("$baseTable.*");
            } else {
                $query->orderBy("$baseTable.$sortBy", $sortDirection);
            }
        }

        return $query;
    }
}
