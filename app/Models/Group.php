<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'group_id',
        'company_id',
    ];

    public function parentGroup()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function childGroups()
    {
        return $this->hasMany(Group::class, 'group_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
