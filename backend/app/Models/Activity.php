<?php

namespace App\Models;

use App\Models\BaseModel;

class Activity extends BaseModel
{
    protected $table = 'activities';
    protected $keyType = 'int';
    protected $primaryKey = 'id';

    public $timestamps = false;
    public $incrementing = true;

    public static $filterColumns = [
        'id' => 'Id',
        'type' => 'Type',
        'title' => 'Title',
        'slug' => 'Slug',
        'active' => 'Active',
        'status' => 'Status',
        'views' => 'Views',
    ];

    public static $sortColumns = [
        'id',
        'type',
        'title',
        'slug',
        'sort_order',
        'active',
        'views',
        'status',
    ];

    protected $fillable = [
        'type',
        'title',
        'slug',
        'desc',
        'image',
        'moral',
        'ages',
        'skills',
        'data',
        'sort_order',
        'active',
        'plans',
        'agama',
        'views',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'ages' => 'array',
            'skills' => 'array',
            'data' => 'array',
            'plans' => 'array',
            'agama' => 'array',
            'active' => 'boolean',
            'views' => 'integer',
        ];
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'slug' => 'required|string|max:255',
        ];
    }

    public static function field_name()
    {
        return 'title';
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function incrementView()
    {
        $this->increment('views');
        return $this->views;
    }
}
