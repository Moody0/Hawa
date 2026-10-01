<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ApiJson
{
    public static function camel(mixed $value): mixed
    {
        if ($value instanceof Model) {
            $model = $value;
            $value = $model->toArray();
            foreach ($model->getCasts() as $field => $cast) {
                if (str_starts_with($cast, 'decimal:') && isset($value[$field])) {
                    $value[$field] = (float) $value[$field];
                }
            }
        }
        if ($value instanceof Collection) {
            $value = $value->all();
        }
        if ($value instanceof \JsonSerializable) {
            $value = $value->jsonSerialize();
        }
        if (is_array($value)) {
            $result = [];
            foreach ($value as $key => $item) {
                $result[is_string($key) ? ($key === 'Name' ? 'Name' : Str::camel($key)) : $key] = self::camel($item);
            }

            return $result;
        }

        return $value;
    }
}
