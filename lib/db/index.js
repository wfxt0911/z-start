
class ProjectDao {
    constructor(db) {
        this.db = db
    }
    getAll() {
        let selectAll = this.db.prepare('select id,name,path from project');
        return selectAll.all();
    }
    selectByNameAndEnv(name, env) {
        let selectStr = this.db.prepare('select  id,name,path,env from project where name=?  and env=?');
        return selectStr.all(name, env);
    }
    selectByEnv(env) {
        let selectStr = this.db.prepare('select  id,name,path,env from project where  env=?');
        return selectStr.all(env);
    }
    selectByName(name) {
        let selectStr = this.db.prepare('select  id,name,path from project where  name=?');
        return selectStr.all(name);
    }
    insert(name, path) {
        var insertStr = this.db.prepare("INSERT INTO project (name,path) VALUES (?,?)");
        return insertStr.run(name, path);
    }
    deleteById(id) {
        if (!id) return
        const delete_stmt = this.db.prepare('DELETE FROM project WHERE id = @id;')
        return delete_stmt.run({ id })
    }

}




module.exports = {
    projectDao: ProjectDao,
}
